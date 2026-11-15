// Run only with approval for publishing nicknames, reviews and comments.
const fs = require('node:fs'), path = require('node:path')
const base = process.env.PREVIEW_SOURCE_URL || 'http://localhost:8080'
const get = async route => { const r = await fetch(base + route); if (!r.ok) throw Error(route + ': ' + r.status); return r.json() }
const pick = (x, keys) => Object.fromEntries(keys.split(' ').filter(k => k in x).map(k => [k, x[k]]))
const comment = x => ({...pick(x, 'commentId parentCommentId authorNickname content createdAt'), authorId: 'preview-author'})
const post = x => ({...pick(x, 'postId restaurantId restaurantName authorNickname title summary rating updatedAt viewCount likeCount address phoneNumber tags oneLineReviews imageFileNames badges'), authorId: 'preview-author', liked: false, bookmarked: false, comments: (x.comments || []).map(comment), commentCount: (x.comments || []).length})
const forum = x => ({...pick(x, 'communicationId title content category writerNickname viewCount replyCount isPinned createdAt updatedAt'), writerId: 'preview-author'})
async function pages(route) { let all=[]; for(let page=0;;page++){const r=await get(`${route}?page=${page}&size=100`);all.push(...r.content);if(r.last || !r.content.length || all.length>=r.totalElements)return all} }
async function main(){
 const restaurants=await get('/restaurants'), summaries=await pages('/posts'), posts=[]
 for(let i=0;i<summaries.length;i+=5)posts.push(...await Promise.all(summaries.slice(i,i+5).map(async p=>post(await get('/posts/'+p.postId)))))
 const communications=[],replies={}
 for(const c of await pages('/communications')){communications.push(forum(await get('/communications/'+c.communicationId))); replies[c.communicationId]=(await get('/communications/'+c.communicationId+'/replies')).map(x=>({...pick(x,'replyId content writerNickname createdAt updatedAt'),writerId:'preview-author'}))}
 const routes={}
 for(const r of ['/blackwhites','/recommendations/intern','/footprints/ceo','/footprints/cc','/influencers/0902','/influencers/6084','/tags','/magazines','/contributors/featured']) routes[r]=await get(r)
 // Never serialize actual employee/login identifiers; preserve public display names.
 const sanitize=x=>Array.isArray(x)?x.map(sanitize):x&&typeof x==='object'?Object.fromEntries(Object.entries(x).filter(([k])=>!/(password|token|email|birth|hint|remoteIp|deviceId|updatedBy|createdBy)/i.test(k)).map(([k,v])=>[k,['authorId','writerId','memberId','influencerEpno'].includes(k)?'preview-author':sanitize(v)])):x
 const snapshot=sanitize({snapshotAt:new Date().toISOString(),restaurants,posts,communications,replies,routes})
 const out=path.join(__dirname,'../src/data/preview-snapshot.json');fs.writeFileSync(out,JSON.stringify(snapshot,null,2)+'\n')
 console.log(JSON.stringify({restaurants:restaurants.length,posts:posts.length,comments:posts.reduce((n,p)=>n+p.comments.length,0),communications:communications.length}))
}
main().catch(e=>{console.error(e.message);process.exitCode=1})
