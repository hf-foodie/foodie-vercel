const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto')
const root=path.resolve(process.argv[2]||'dist'),mode=process.argv[3]||'create'
const manifest=path.join(root,'SHA256SUMS.json')
function scan(directory){return fs.readdirSync(directory,{withFileTypes:true}).flatMap(entry=>{
 const file=path.join(directory,entry.name)
 if(entry.isSymbolicLink())throw new Error('Artifact must not contain symlinks: '+file)
 if(entry.isDirectory() && ['frontend/.next/cache','frontend/.next/server/route-cache'].includes(path.relative(root,file).replaceAll('\\','/')))return []
 return entry.isDirectory()?scan(file):file===manifest?[]:[file]
})}
const actual={}
for(const file of scan(root).sort())actual[path.relative(root,file).replaceAll('\\','/')]=crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex')
if(mode==='verify'){
 const expected=JSON.parse(fs.readFileSync(manifest,'utf8'))
 if(JSON.stringify(actual)!==JSON.stringify(expected))throw new Error('Artifact manifest mismatch: files added, removed or changed')
 console.log('Verified artifact files:',Object.keys(actual).length)
}else{fs.writeFileSync(manifest,JSON.stringify(actual,null,2)+'\n');console.log('Recorded artifact files:',Object.keys(actual).length)}
