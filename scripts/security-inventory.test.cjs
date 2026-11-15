const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto')
const root=path.resolve(__dirname,'..'),read=p=>JSON.parse(fs.readFileSync(path.join(root,p),'utf8'))
const sha=p=>crypto.createHash('sha256').update(fs.readFileSync(path.join(root,p))).digest('hex')
test('published inventory matches lockfile and SBOM bytes; references and component versions are complete',()=>{
 const inventory=read('public/security/inventory.json'),bom=read('public/security/sbom.cdx.json'),lock=read('package-lock.json')
 assert.equal(inventory.packageLockSha256,sha('package-lock.json'),'Regenerate security inventory after dependency changes')
 assert.equal(inventory.sbomSha256,sha('public/security/sbom.cdx.json'))
 assert.equal(bom.components.length,inventory.rows.length)
 assert.equal(new Set(bom.components.map(x=>x['bom-ref'])).size,bom.components.length)
 for(const [location,p] of Object.entries(lock.packages))if(location&&p.version){const c=bom.components.find(x=>x['bom-ref']===`npm:${location}`);assert.ok(c,location);assert.equal(c.version,p.version)}
 assert.ok(inventory.server.packagedCount>0)
 assert.equal(inventory.rows.filter(x=>x.usage==='운영 JAR 포함').length,inventory.server.packagedCount)
 assert.ok(!JSON.stringify(bom).includes('C:\\Users\\'))
})
