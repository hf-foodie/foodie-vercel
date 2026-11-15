// Run in the preparation environment after both audits. No network calls.
const fs = require('node:fs'), path = require('node:path'), crypto = require('node:crypto')
const root = path.resolve(__dirname, '..'), workspace = path.dirname(root)
const read = p => JSON.parse(fs.readFileSync(p, 'utf8').replace(/^\uFEFF/, ''))
const hash = p => crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex')
const lockPath = path.join(root, 'package-lock.json'), lock = read(lockPath)
const server = read(path.join(workspace, 'foodie/verification/technology-server-audit.json'))
const npmPath = path.join(workspace, 'foodie/verification/technology-npm-audit.json'), audit = read(npmPath)
if (!audit.metadata?.vulnerabilities || audit.error) throw Error('Valid npm audit required')
const jar = process.argv[2] ? path.resolve(process.argv[2]) : path.join(workspace, 'foodie/app/backend/server.jar')
if (hash(jar) !== server.jarSha256.toLowerCase()) throw Error('Server audit does not match deployed JAR')
const components = [], rows = [], seen = new Set()
function add(c, ecosystem, usage) {
  if (seen.has(c['bom-ref'])) throw Error('Duplicate component reference')
  seen.add(c['bom-ref']); components.push(c)
  rows.push({name:c.group ? `${c.group}:${c.name}` : c.name, version:c.version, ecosystem, usage, purl:c.purl || '', license:c.licenses?.[0]?.license?.name || '미확인'})
}
for (const [location, entry] of Object.entries(lock.packages)) {
  if (!location || !entry.version) continue
  const name = entry.name || location.split('node_modules/').pop()
  const usage = entry.dev ? '개발·빌드' : '앱 의존성 (잠금 파일)'
  const c = {type:'library', 'bom-ref':`npm:${location}`, name, version:entry.version, purl:`pkg:npm/${name.replace('@','%40')}@${entry.version}`, properties:[{name:'foodie:scope',value:usage},{name:'foodie:lock-location',value:location}]}
  if (typeof entry.license === 'string') c.licenses = [{license:{name:entry.license}}]
  const sri = entry.integrity?.split(' ')[0]?.match(/^(sha256|sha384|sha512)-(.+)$/)
  if (sri) c.hashes = [{alg:`SHA-${sri[1].slice(3)}`,content:Buffer.from(sri[2],'base64').toString('hex')}]
  add(c, 'npm', usage)
}
for (const dep of server.dependencies) {
  const [group,name] = dep.name.split(':')
  const packaged = server.packaged.some(p=>p.name===dep.name && p.version===dep.version)
  const usage = packaged ? '운영 JAR 포함' : 'Gradle 잠금 (빌드·시험·BOM 포함)'
  const purl = `pkg:maven/${group}/${name}@${dep.version}`
  add({type:'library','bom-ref':purl,group,name,version:dep.version,purl,properties:[{name:'foodie:scope',value:usage}]}, 'Maven', usage)
}
const release = read(path.join(workspace,'foodie/release.json'))
for (const [name,version,file] of [['Node.js',release.runtimes.node,'node/node.exe'],['Oracle JDK',release.runtimes.java,'java/bin/java.exe']]) {
  add({type:'platform','bom-ref':`runtime:${name}`,name,version,hashes:[{alg:'SHA-256',content:hash(path.join(workspace,'foodie/runtimes',file))}],description:'Hash identifies the launcher executable, not the entire runtime distribution.'},'Runtime','운영 런타임')
}
const generatedAt = new Date().toISOString()
const bom = {bomFormat:'CycloneDX',specVersion:'1.6',version:1,serialNumber:`urn:uuid:${crypto.randomUUID()}`,metadata:{timestamp:generatedAt,component:{type:'application',name:'오늘뭐먹지',version:lock.version},properties:[{name:'foodie:package-lock-sha256',value:hash(lockPath)},{name:'foodie:server-jar-sha256',value:hash(jar)},{name:'foodie:scope',value:'npm lock inventory including development and optional platforms; Maven lock and packaged JAR; runtime launchers. Dependency graph, OS packages, nested shaded code and runtime native subcomponents are not fully inventoried.'}]},components}
const out = path.join(root,'public/security'); fs.mkdirSync(out,{recursive:true})
fs.writeFileSync(path.join(out,'sbom.cdx.json'),JSON.stringify(bom,null,2)+'\n')
const summary = {generatedAt,packageLockSha256:hash(lockPath),serverJarSha256:hash(jar),sbomSha256:hash(path.join(out,'sbom.cdx.json')),npm:{checkedAt:fs.statSync(npmPath).mtime.toISOString(),vulnerabilities:audit.metadata.vulnerabilities},server:{checkedAt:server.checkedAt,auditedCount:server.auditedCount,packagedCount:server.packagedCount,findings:server.findings},rows:rows.sort((a,b)=>a.ecosystem.localeCompare(b.ecosystem)||a.name.localeCompare(b.name)||a.version.localeCompare(b.version))}
fs.writeFileSync(path.join(out,'inventory.json'),JSON.stringify(summary,null,2)+'\n')
console.log(`Generated ${components.length} components; npm findings ${audit.metadata.vulnerabilities.total}; Maven findings ${server.findings.length}`)
