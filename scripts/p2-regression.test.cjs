const {test}=require('node:test')
const assert=require('node:assert/strict')
const {spawnSync}=require('node:child_process')
const fs=require('node:fs'),os=require('node:os'),path=require('node:path')
test('authentication regression suite rejects deliberately removed origin guard',()=>{
 const env={...process.env,P2_TEST_REMOVE_ORIGIN_CHECK:'1'}
 for(const name of Object.keys(env))if(name.startsWith('NODE_TEST_'))delete env[name]
 const run=spawnSync(process.execPath,['--test','--test-reporter=tap','scripts/p1-auth.test.cjs'],{
   encoding:'utf8',env,timeout:30000,
 })
 assert.notEqual(run.status,0)
 assert.match(run.stdout,/not ok .*rejects foreign origin/)
})
test('release manifest detects changed and unexpected files',()=>{
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'foodie-artifact-'))
 const run=mode=>spawnSync(process.execPath,['scripts/artifact-manifest.cjs',dir,mode],{encoding:'utf8'})
 try{
  fs.writeFileSync(path.join(dir,'asset.txt'),'original');assert.equal(run('create').status,0);assert.equal(run('verify').status,0)
  const cache=path.join(dir,'frontend/.next/server/route-cache/APP_ROUTE/test');fs.mkdirSync(cache,{recursive:true});fs.writeFileSync(path.join(cache,'favicon.ico.body'),'runtime cache');assert.equal(run('verify').status,0)
  fs.writeFileSync(path.join(dir,'asset.txt'),'changed');assert.notEqual(run('verify').status,0)
  fs.writeFileSync(path.join(dir,'asset.txt'),'original');fs.writeFileSync(path.join(dir,'unexpected.txt'),'extra');assert.notEqual(run('verify').status,0)
 }finally{fs.rmSync(dir,{recursive:true,force:true})}
})
