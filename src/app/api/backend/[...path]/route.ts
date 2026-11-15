import { apiBase, refreshSession, sessionCookies, TokenPair } from '@/lib/server-session'
import { NextRequest, NextResponse } from 'next/server'

async function handle(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  const { path } = await context.params
  if (path.some((p) => !p || p === '.' || p === '..' || /[\\/]/.test(p)))
    return NextResponse.json({ message: '잘못된 경로입니다.' }, { status: 400 })
  const route = path.join('/')
  const login = (route === 'sessions' && request.method === 'POST') || route === 'auth/login'
  const logout = (route === 'sessions/current' && request.method === 'DELETE') || route === 'auth/logout'
  const recovery = route.startsWith('password/') || route.startsWith('password-recovery/') || route === 'password-resets'
  if (route === 'auth/refresh' || route === 'auth/logout-all' || route === 'session-tokens' || (route === 'sessions' && request.method === 'DELETE'))
    return NextResponse.json({ message: '허용되지 않는 경로입니다.' }, { status: 403 })
  if (!['GET', 'HEAD'].includes(request.method)) {
    const origin = process.env.APP_ORIGIN || request.nextUrl.origin
    if (request.headers.get('origin') !== origin || request.headers.get('sec-fetch-site') === 'cross-site')
      return NextResponse.json({ message: '허용되지 않은 요청 출처입니다.' }, { status: 403 })
  }
  try {
    const headers = new Headers()
    for (const key of ['content-type', 'x-device-id']) {
      const value = request.headers.get(key)
      if (value) headers.set(key, value)
    }
    // Enable only behind an ingress that overwrites this header with the actual peer IP.
    if (process.env.FOODIE_TRUST_CLIENT_IP_HEADER === 'true' && (process.env.FOODIE_PROXY_SECRET?.length || 0) >= 32) {
      const clientIp = request.headers.get('x-foodie-client-ip')
      if (clientIp && clientIp.length <= 64) {
        headers.set('X-Foodie-Client-IP', clientIp)
        headers.set('X-Foodie-Proxy-Secret', process.env.FOODIE_PROXY_SECRET!)
      }
    }
    const access = request.cookies.get('accessToken')?.value
    if (access && !login && !recovery) headers.set('Authorization', `Bearer ${access}`)
    const body = ['GET', 'HEAD'].includes(request.method) ? undefined : await request.arrayBuffer()
    if (body && body.byteLength > 6 * 1024 * 1024)
      return NextResponse.json(
        { message: '요청 용량이 너무 큽니다. 이미지는 장당 5MB까지 가능합니다.' },
        { status: 400 }
      )
    const send = () =>
      fetch(`${apiBase()}/${path.map(encodeURIComponent).join('/')}${request.nextUrl.search}`, {
        method: request.method,
        headers,
        body,
        cache: 'no-store',
        redirect: 'manual',
        signal: AbortSignal.timeout(30000),
      })
    let upstream = await send()
    let pair: TokenPair | null | undefined
    const refresh = request.cookies.get('refreshToken')?.value
    if (upstream.status === 401 && refresh && !login && !recovery) {
      pair = await refreshSession(refresh)
      if (pair) {
        headers.set('Authorization', `Bearer ${pair.accessToken}`)
        upstream = await send()
      }
    }
    if (login && upstream.ok)
      return sessionCookies(NextResponse.json({ success: true }), await upstream.json())
    if (logout && (upstream.ok || (upstream.status === 401 && pair === null)))
      return sessionCookies(NextResponse.json({ success: true }), null)
    const response = new NextResponse(upstream.status === 204 ? null : await upstream.arrayBuffer(), {
      status: upstream.status,
      headers: {
        'Content-Type': upstream.headers.get('content-type') || 'application/json',
        'Cache-Control': 'no-store',
        'X-Content-Type-Options': 'nosniff',
      },
    })
    const location = upstream.headers.get('location')
    if (location?.startsWith('/') && !location.startsWith('//')) response.headers.set('Location', '/api/backend' + location)
    const retryAfter = upstream.headers.get('retry-after')
    if (retryAfter) response.headers.set('Retry-After', retryAfter)
    if (pair !== undefined) sessionCookies(response, pair)
    return response
  } catch {
    return NextResponse.json({ message: '서버에 연결할 수 없습니다. 잠시 후 다시 시도해주세요.' }, { status: 502 })
  }
}
export { handle as DELETE, handle as GET, handle as PATCH, handle as POST, handle as PUT }
