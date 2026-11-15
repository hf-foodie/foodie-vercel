import snapshot from '@/data/preview-snapshot.json'

export const PREVIEW_NOTICE = '내부망에 정식 서비스 오픈 후 이용가능'
const norm = (s: unknown) => String(s ?? '').toLowerCase().replace(/\s+/g, '')
const includes = (s: unknown, q: string | null) => !q || norm(s).includes(norm(q))
function page<T>(items: T[], p: URLSearchParams) {
  const number = Math.max(0, Number(p.get('page')) || 0)
  const size = Math.min(100, Math.max(1, Number(p.get('size')) || 8))
  return {content: items.slice(number * size, (number + 1) * size), totalElements: items.length, totalPages: Math.ceil(items.length / size), number, size, last: (number + 1) * size >= items.length}
}
export function previewResponse(input: string, method = 'GET'): Response {
  if (!['GET','HEAD'].includes(method.toUpperCase())) return Response.json({message:PREVIEW_NOTICE},{status:405,headers:{Allow:'GET, HEAD'}})
  const url = new URL(input, 'https://preview.invalid'), path = url.pathname, p = url.searchParams
  const json = (value: unknown) => Response.json(value, {headers:{'Cache-Control':'no-store'}})
  if (path === '/me') return Response.json({message:PREVIEW_NOTICE},{status:401})
  if (path === '/me/bookmarks/ids') return json([])
  if (path === '/restaurants/count') return json(snapshot.restaurants.filter(x=>includes(x.address,p.get('address'))).length)
  if (path === '/restaurants') return json(snapshot.restaurants.filter(x=>includes(x.address,p.get('address')) && includes(x.name,p.get('name')) && includes(x.representativeMenuNames.join(' '),p.get('representativeMenuNames'))))
  const restaurant = path.match(/^\/restaurants\/(\d+)$/)
  if (restaurant) {const found=snapshot.restaurants.find(x=>String(x.restaurantId)===restaurant[1]);return found?json(found):Response.json({message:'식당이 없습니다.'},{status:404})}
  if (path === '/posts') {
    let items=snapshot.posts.filter(x=>{
      const query=p.get('search'), tag=p.get('tag')?.split(',').map(v=>norm(v.replace(/^#/,''))).filter(Boolean)
      return (!p.get('restaurantId') || String(x.restaurantId)===p.get('restaurantId')) && includes(x.address,p.get('region')) && includes(x.address,p.get('address')) && includes(x.restaurantName,p.get('restaurantName')) && (!query || [x.title,x.restaurantName,x.authorNickname,x.summary,x.address,...x.tags].some(v=>includes(v,query))) && (!tag?.length || x.tags.some(t=>tag.includes(norm(t))))
    })
    const order=p.get('order') || 'most-recent'
    items=[...items].sort((a,b)=>order.includes('comment')?b.commentCount-a.commentCount:order.includes('like')?b.likeCount-a.likeCount:order.includes('view')?b.viewCount-a.viewCount:order.includes('old')?Number(a.postId)-Number(b.postId):Number(b.postId)-Number(a.postId))
    return json(page(items,p))
  }
  const post = path.match(/^\/posts\/(\d+)(?:\/(comments|like|bookmark))?$/)
  if(post){const found=snapshot.posts.find(x=>String(x.postId)===post[1]);if(!found)return Response.json({message:'후기가 없습니다.'},{status:404});return json(post[2]==='comments'?found.comments:post[2]==='like'?{liked:false,likeCount:found.likeCount}:post[2]==='bookmark'?{restaurantId:found.restaurantId,bookmarked:false}:found)}
  if(path==='/communications') {
    if(p.get('mine')==='true')return Response.json({message:PREVIEW_NOTICE},{status:403})
    const items=snapshot.communications.filter(x=>(!p.get('category')||x.category===p.get('category'))&&includes(p.get('searchType')==='author'?x.writerNickname:x.title,p.get('q'))).sort((a,b)=>Number(b.isPinned)-Number(a.isPinned)||b.communicationId-a.communicationId)
    return json(page(items,p))
  }
  const forum=path.match(/^\/communications\/(\d+)(?:\/(replies))?$/)
  if(forum){const found=snapshot.communications.find(x=>String(x.communicationId)===forum[1]);return found?json(forum[2]?(snapshot.replies as Record<string,unknown>)[forum[1]]||[]:found):Response.json({message:'게시글이 없습니다.'},{status:404})}
  const routes=snapshot.routes as Record<string,unknown>
  if(path in routes) return json(routes[path])
  if(path.startsWith('/magazines/')){const found=snapshot.routes['/magazines'].items.find(x=>String(x.magazineId)===path.split('/')[2]);if(found)return json(found)}
  return Response.json({message:PREVIEW_NOTICE},{status:404})
}
