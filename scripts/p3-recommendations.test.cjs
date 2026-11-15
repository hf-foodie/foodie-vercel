const {test}=require('node:test')
const assert=require('node:assert/strict')
const fs=require('node:fs')
const crypto=require('node:crypto')
test('all 20 original recommendation photographs survive migration byte for byte',()=>{
  const source=fs.readFileSync('src/data/influencer-intern.ts','utf8')
  const imports=[...source.matchAll(/import intern_(\d+) from "@\/images\/influencer\/intern\/(.*?)";/g)]
  assert.equal(imports.length,20)
  const hash=file=>crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex')
  for(const [,number,name] of imports)assert.equal(hash(`public/images/intern/${number}.png`),hash(`src/images/influencer/intern/${name}`))
})
