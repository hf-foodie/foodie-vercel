const { test } = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const vm = require('node:vm')
const ts = require('typescript')
const { NextRequest, NextResponse } = require('next/server')
function load(file, overrides = {}) {
  const module = { exports: {} }
  let source = fs.readFileSync(file, 'utf8')
  // Test-only mutation in memory: prove the regression suite catches a removed origin check.
  if (process.env.P2_TEST_REMOVE_ORIGIN_CHECK === '1' && file.endsWith('/route.ts'))
    source = source.replace("request.headers.get('origin') !== origin", 'false')
  const js = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText
  vm.runInNewContext(js, { module, exports: module.exports,
    require: name => overrides[name] || require(name), process, fetch: (...args) => global.fetch(...args),
    Headers, Response, AbortSignal, Map, Promise, Error,
  })
  return module.exports
}
test('P1 authentication gateway', async t => {
  const realFetch = global.fetch
  process.env.API_URL = 'http://backend.invalid'
  process.env.APP_ORIGIN = 'http://app.invalid'
  const session = load('src/lib/server-session.ts')
  const route = load('src/app/api/backend/[...path]/route.ts', { '@/lib/server-session': session })
  const call = (path, method = 'GET', cookie = '', origin = 'http://app.invalid') => route[method](
    new NextRequest(`http://app.invalid/api/backend/${path}`, { method,
      headers: { origin, cookie, 'x-device-id': 'test-device' },
      ...(['GET','HEAD'].includes(method) ? {} : { body: '{}' }),
    }), { params: Promise.resolve({ path: path.split('/') }) })
  try {
    await t.test('rejects foreign origin before calling backend', async () => {
      global.fetch = () => { throw new Error('must not call backend') }
      assert.equal((await call('posts', 'POST', '', 'https://evil.invalid')).status, 403)
    })
    await t.test('login hides credentials and issues HttpOnly cookies', async () => {
      global.fetch = async () => Response.json({ accessToken: 'secret-access', refreshToken: 'secret-refresh' })
      const response = await call('auth/login', 'POST')
      assert.deepEqual(await response.json(), { success: true })
      assert.match(response.headers.get('set-cookie'), /HttpOnly/i)
      assert.match(response.headers.get('set-cookie'), /SameSite=lax/i)
    })
    await t.test('resource session endpoints keep tokens in HttpOnly cookies and block direct refresh', async () => {
      global.fetch = async () => Response.json({accessToken:'a',refreshToken:'r'},{status:201})
      const login = await call('sessions','POST')
      assert.deepEqual(await login.json(),{success:true}); assert.match(login.headers.get('set-cookie'),/HttpOnly/i)
      const logout = await call('sessions/current','DELETE','accessToken=a')
      assert.match(logout.headers.get('set-cookie'),/Max-Age=0/i)
      global.fetch = () => { throw Error('must not forward') }
      assert.equal((await call('session-tokens','POST')).status,403)
      assert.equal((await call('sessions','DELETE')).status,403)
    })
    await t.test('production cookies require HTTPS', async () => {
      const old=process.env.NODE_ENV; process.env.NODE_ENV='production'
      try { assert.match(session.sessionCookies(NextResponse.json({}),{accessToken:'a',refreshToken:'r'}).headers.get('set-cookie'),/Secure/i) }
      finally { if(old===undefined) delete process.env.NODE_ENV; else process.env.NODE_ENV=old }
    })
    await t.test('explicit HTTP deployment supports login and cookie clearing', () => {
      const oldProtocol = process.env.PROTOCOL, oldNodeEnv = process.env.NODE_ENV
      process.env.NODE_ENV = 'production'; process.env.PROTOCOL = 'http'
      try {
        for (const pair of [{ accessToken: 'a', refreshToken: 'r' }, null]) {
          const header = session.sessionCookies(NextResponse.json({}), pair).headers.get('set-cookie')
          assert.doesNotMatch(header, /; Secure/i)
          assert.match(header, /HttpOnly/i)
          assert.match(header, /SameSite=lax/i)
          if (!pair) assert.match(header, /Max-Age=0/i)
        }
        process.env.PROTOCOL = 'https'
        assert.match(session.sessionCookies(NextResponse.json({}), {accessToken:'a',refreshToken:'r'}).headers.get('set-cookie'), /; Secure/i)
      } finally {
        if (oldProtocol === undefined) delete process.env.PROTOCOL; else process.env.PROTOCOL = oldProtocol
        if (oldNodeEnv === undefined) delete process.env.NODE_ENV; else process.env.NODE_ENV = oldNodeEnv
      }
    })
    await t.test('expired access refreshes once and retries once', async () => {
      let refreshes = 0, requests = 0
      global.fetch = async (url, init) => {
        if (url.endsWith('/session-tokens')) { refreshes++; return Response.json({ accessToken:'new',refreshToken:'refresh' }) }
        requests++
        return init.headers.get('Authorization') === 'Bearer new' ? Response.json({ id:'me' }) : new Response(null,{status:401})
      }
      const response = await call('me', 'GET', 'accessToken=old; refreshToken=refresh')
      assert.equal(response.status, 200); assert.equal(refreshes,1); assert.equal(requests,2)
    })
    await t.test('expired refresh clears cookies without retry loop', async () => {
      let calls=0
      global.fetch = async () => {calls++; return new Response(null,{status:401})}
      const response=await call('me','GET','accessToken=old; refreshToken=expired')
      assert.equal(response.status,401); assert.equal(calls,2)
      assert.match(response.headers.get('set-cookie'),/Max-Age=0/i)
    })
    await t.test('concurrent refreshes share one in-flight request', async () => {
      let count=0, release
      global.fetch=async()=>{ count++; await new Promise(resolve=>{release=resolve}); return Response.json({accessToken:'new',refreshToken:'same'}) }
      const a=session.refreshSession('same'),b=session.refreshSession('same')
      release(); await Promise.all([a,b]); assert.equal(count,1)
    })
    await t.test('logout failure preserves cookies for retry; success deletes both', async () => {
      global.fetch=async()=>new Response(null,{status:500})
      assert.equal((await call('auth/logout','POST','accessToken=a; refreshToken=r')).headers.get('set-cookie'),null)
      global.fetch=async()=>new Response(null,{status:200})
      const response=await call('auth/logout','POST','accessToken=a; refreshToken=r')
      assert.match(response.headers.get('set-cookie'),/accessToken=;.*Max-Age=0/i)
      assert.match(response.headers.get('set-cookie'),/refreshToken=;.*Max-Age=0/i)
    })
    await t.test('recovery uses no expired credentials or refresh retry and preserves throttling', async () => {
      let calls=0
      global.fetch=async (url,init)=>{calls++;assert.equal(init.headers.get('Authorization'),null);return Response.json({message:'wait'},{status:429,headers:{'Retry-After':'900'}})}
      const response=await call('password/verify','POST','accessToken=old; refreshToken=old')
      assert.equal(response.status,429);assert.equal(response.headers.get('Retry-After'),'900');assert.equal(calls,1)
    })
    await t.test('client IP headers are ignored unless a trusted ingress is explicitly configured', async () => {
      const send=()=>route.GET(new NextRequest('http://app.invalid/api/backend/me',{headers:{'x-foodie-client-ip':'203.0.113.7','x-foodie-proxy-secret':'forged'}}),{params:Promise.resolve({path:['me']})})
      global.fetch=async(url,init)=>{assert.equal(init.headers.get('X-Foodie-Client-IP'),null);assert.equal(init.headers.get('X-Foodie-Proxy-Secret'),null);return Response.json({})}
      await send()
      process.env.FOODIE_TRUST_CLIENT_IP_HEADER='true';process.env.FOODIE_PROXY_SECRET='test-only-proxy-secret-0123456789'
      try {
        global.fetch=async(url,init)=>{assert.equal(init.headers.get('X-Foodie-Client-IP'),'203.0.113.7');assert.equal(init.headers.get('X-Foodie-Proxy-Secret'),process.env.FOODIE_PROXY_SECRET);return Response.json({})}
        await send()
      } finally {delete process.env.FOODIE_TRUST_CLIENT_IP_HEADER;delete process.env.FOODIE_PROXY_SECRET}
    })
    await t.test('rendering proxy forwards renewed cookie to the same render', async () => {
      const proxy=load('src/proxy.ts',{'@/lib/server-session':session})
      global.fetch=async url=>url.endsWith('/me')?new Response(null,{status:401}):Response.json({accessToken:'renewed',refreshToken:'r'})
      const response=await proxy.proxy(new NextRequest('http://app.invalid/posts/1',{headers:{cookie:'accessToken=old; refreshToken=r'}}))
      assert.match(response.headers.get('x-middleware-request-cookie'),/accessToken=renewed/)
      assert.match(response.headers.get('set-cookie'),/HttpOnly/i)
    })
  } finally { global.fetch=realFetch; delete process.env.API_URL; delete process.env.APP_ORIGIN }
})

test('query errors distinguish empty results, missing records, login and outage',async()=>{
  const nav={notFound:()=>{throw new Error('NOT_FOUND')},redirect:url=>{throw new Error(url)}}
  const {readApi}=load('src/lib/readApi.ts',{'next/navigation':nav})
  assert.deepEqual(Array.from(await readApi(Response.json([]))),[])
  await assert.rejects(readApi(new Response(null,{status:404}),true),/NOT_FOUND/)
  await assert.rejects(readApi(new Response(null,{status:401})),/session-expired/)
  await assert.rejects(readApi(new Response(null,{status:403})),/권한/)
  await assert.rejects(readApi(new Response(null,{status:500})),/불러오지/)
})
