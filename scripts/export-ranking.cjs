// Export only the public aggregate ranking API; never read DB files or member records.
const fs=require('node:fs'),path=require('node:path');
(async()=>{
 const base=process.argv[2]||'http://localhost/api/backend';const scopes={};
 async function read(period,office=''){const r=await fetch(base+'/rankings/weekly?'+new URLSearchParams({period,office}));if(!r.ok)throw Error('Ranking export failed: '+r.status);const data=await r.json();return {weekStart:data.weekStart,weekEnd:data.weekEnd,generatedAt:data.generatedAt,collectedFrom:data.collectedFrom,finalized:data.finalized,offices:data.offices,entries:data.entries.map(x=>({restaurantId:x.restaurantId,name:x.name,address:x.address,rank:x.rank,score:x.score,views:x.views,likes:x.likes,bookmarks:x.bookmarks,participants:x.participants,change:x.change})),preview:true};}
 const current=await read('current'),previous=await read('previous');
 for(const office of current.offices)for(const period of ['current','previous'])scopes[office+':'+period]=await read(period,office);
 fs.writeFileSync(path.join(__dirname,'../src/data/preview-ranking.json'),JSON.stringify({current,previous,scopes},null,2)+'\n');console.log('Exported public aggregate ranking; no individual member data.');
})().catch(e=>{console.error(e.message);process.exit(1)});
