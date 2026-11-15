const fs=require('node:fs')
const path=require('node:path')
const {ESLint}=require('eslint')
const {normalizeLintKey}=require('./lint-key.cjs')
;(async()=>{
  const results=await new ESLint().lintFiles(['src'])
  const current={}
  for(const result of results){
    const lines=fs.readFileSync(result.filePath,'utf8').split(/\r?\n/)
    for(const error of result.messages.filter(x=>x.severity===2)){
      const key=normalizeLintKey(JSON.stringify([path.relative(process.cwd(),result.filePath).replaceAll('\\','/'),error.ruleId,error.message,lines[error.line-1]?.trim()]))
      current[key]=(current[key]||0)+1
    }
  }
  const file='scripts/lint-baseline.json'
  if(process.argv.includes('--record')){fs.writeFileSync(file,JSON.stringify(current,null,2)+'\n');console.log('Recorded existing errors:',Object.values(current).reduce((a,b)=>a+b,0));return}
  const baseline=JSON.parse(fs.readFileSync(file,'utf8'))
  const added=Object.entries(current).filter(([key,count])=>count>(baseline[key]||0))
  if(added.length){console.error('New lint errors:',added);process.exitCode=1}
  else console.log('No new lint errors; existing baseline remains visible in scripts/lint-baseline.json')
})().catch(error=>{console.error(error);process.exitCode=1})
