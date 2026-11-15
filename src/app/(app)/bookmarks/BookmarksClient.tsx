'use client'
import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import BookmarkBtn from '@/components/BookmarkBtn'
import { Breadcrumb, PageHeading } from '@/components/krds/PageHeading'
import { clientFetch } from '@/lib/clientFetch'
import { bookmarkListHref, bookmarkedReviewsHref } from '@/lib/bookmarkNavigation'
import { saveBookmarkPosition, useBookmarkScroll } from '@/lib/bookmarkScroll'
type Item = {restaurantId:number;name:string;address:string;category:string;phoneNumber:string;savedAt:string;reviewCount:number}
type Result = {content:Item[];totalElements:number;number:number;size:number;totalPages:number}
function Photo({id,name}:{id:number;name:string}) {
 const [failed,setFailed]=useState(false)
 return failed ? <div className="flex h-full items-center justify-center bg-slate-100 text-sm text-slate-500">등록된 사진이 없습니다</div> : <img src={`/images/restaurant/thumbnail/${id}.jpg`} alt={name+' 사진'} onError={()=>setFailed(true)} className="h-full w-full object-contain" />
}
export default function BookmarksClient() { const query=useSearchParams().toString(); return <BookmarksView key={query} query={query}/> }
function BookmarksView({query}:{query:string}) {
 const params=new URLSearchParams(query), router=useRouter()
 const [result,setResult]=useState<Result|null>(null),[error,setError]=useState(''),[loading,setLoading]=useState(true),[login,setLogin]=useState(false),[version,setVersion]=useState(0)
 const [q,setQ]=useState(params.get('q')||''),[region,setRegion]=useState(params.get('region')||''),[category,setCategory]=useState(params.get('category')||''),[sort,setSort]=useState(params.get('sort')||'recent')
 useEffect(()=>{
  const refresh=()=>{setError('');setLogin(false);setVersion(v=>v+1)}
  window.addEventListener('restaurant-bookmark-changed',refresh);window.addEventListener('focus',refresh)
  return ()=>{window.removeEventListener('restaurant-bookmark-changed',refresh);window.removeEventListener('focus',refresh)}
 },[])
 useEffect(()=>{
  const controller=new AbortController()

  const p=new URLSearchParams(query)
  const requested=Number(p.get('page')||1)
  p.set('page',String(Number.isSafeInteger(requested)&&requested>0?requested-1:0));p.set('size','12')
  clientFetch('/me/bookmarks?'+p,{signal:controller.signal}).then(async r=>{
   if(r.status===401){setLogin(true);setResult(null);return}
   if(!r.ok)throw new Error('저장한 맛집을 불러오지 못했습니다.')
   const data:Result=await r.json(); if(controller.signal.aborted)return
   setResult(data)
   if(data.number+1!==requested){const adjusted=new URLSearchParams(query);adjusted.set('page',String(data.number+1));router.replace('/bookmarks?'+adjusted,{scroll:false})}
  }).catch(e=>{if(!controller.signal.aborted)setError(e instanceof Error?e.message:'목록을 불러오지 못했습니다.')}).finally(()=>{if(!controller.signal.aborted)setLoading(false)})
  return ()=>controller.abort()
 },[query,version,router])
 const listHref=bookmarkListHref(params)
 useBookmarkScroll(listHref,!loading && !error && !!result)
 const href=(page:number)=>{const p=new URLSearchParams(query);p.set('page',String(page));return '/bookmarks?'+p}
 return <main className="kr-container kr-main">
  <Breadcrumb current="저장한 맛집"/><PageHeading title="저장한 맛집" description="다시 가고 싶은 식당을 모아보고, 동료들의 후기를 확인하세요."/>
  <form className="kr-form-panel mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4" onSubmit={e=>{e.preventDefault();const p=new URLSearchParams();if(q.trim())p.set('q',q.trim());if(region.trim())p.set('region',region.trim());if(category.trim())p.set('category',category.trim());p.set('sort',sort);router.push('/bookmarks?'+p)}}>
   <label className="min-w-0">식당명·주소<input className="mt-2 block w-full rounded border p-3" aria-label="저장한 맛집 검색" maxLength={200} value={q} onChange={e=>setQ(e.target.value)} placeholder="식당명 또는 주소"/></label>
   <label className="min-w-0">지역<input className="mt-2 block w-full rounded border p-3" aria-label="저장한 맛집 지역" maxLength={100} value={region} onChange={e=>setRegion(e.target.value)} placeholder="예: 부산"/></label>
   <label className="min-w-0">음식 분류<input className="mt-2 block w-full rounded border p-3" aria-label="저장한 맛집 분류" maxLength={50} value={category} onChange={e=>setCategory(e.target.value)} placeholder="예: 한식 (정확히 입력)"/></label>
   <label>정렬<select className="mt-2 block w-full rounded border p-3" value={sort} onChange={e=>setSort(e.target.value)}><option value="recent">최근 저장순</option><option value="name">식당명순</option></select></label>
   <div className="flex flex-wrap gap-3 sm:col-span-2 lg:col-span-4"><button className="kr-button" type="submit">검색</button><Link className="kr-button" href="/bookmarks">초기화</Link></div>
  </form>
  {login ? <div role="status" className="kr-form-panel">로그인하면 저장한 맛집을 확인할 수 있습니다. <Link className="kr-link" href={'/login?next='+encodeURIComponent('/bookmarks'+(query?'?'+query:''))}>로그인</Link></div> : error ? <div role="alert">{error} <button className="kr-button" onClick={()=>{setLoading(true);setError('');setLogin(false);setVersion(v=>v+1)}}>다시 시도</button></div> : loading ? <p role="status">저장한 맛집을 불러오고 있습니다.</p> : result && <>
   <p className="mb-4" role="status">저장한 맛집 {result.totalElements}곳</p>
   {!result.content.length ? <div className="kr-form-panel"><p>{q||region||category?'검색 조건에 맞는 저장한 맛집이 없습니다.':'아직 저장한 맛집이 없습니다. 마음에 드는 식당의 저장 버튼을 눌러보세요.'}</p><Link className="kr-link" href="/restaurant/hf">맛집 둘러보기</Link></div> : <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
    {result.content.map(item=><article id={'bookmark-restaurant-'+item.restaurantId} key={item.restaurantId} className="overflow-hidden rounded-xl border border-slate-200" data-restaurant-id={item.restaurantId}>
     <div className="h-44 bg-slate-50"><Photo id={item.restaurantId} name={item.name}/></div>
     <div className="space-y-3 p-5"><div className="flex items-start justify-between gap-3"><h2 className="text-xl font-bold">{item.name}</h2><BookmarkBtn restaurantId={item.restaurantId} bookmarked/></div>
      <span className="kr-badge">{item.category||'식당'}</span><p>{item.address}</p>{item.phoneNumber&&<p>{item.phoneNumber}</p>}
      <p className="kr-muted">저장일 {new Date(item.savedAt).toLocaleDateString('ko-KR')}</p>
      <Link className="kr-link" href={bookmarkedReviewsHref(item.restaurantId,listHref)} onClick={e=>{const card=e.currentTarget.closest('article');if(card)saveBookmarkPosition(listHref,item.restaurantId,card)}}>관련 후기 {item.reviewCount}개 보기 →</Link>
     </div></article>)}
   </div>}
   {result.totalPages>1&&<nav aria-label="저장한 맛집 페이지" className="mt-8 flex flex-wrap items-center justify-center gap-4">{result.number>0&&<Link className="kr-button" href={href(result.number)}>이전 페이지</Link>}<span>{result.number+1} / {result.totalPages} 페이지</span>{result.number+1<result.totalPages&&<Link className="kr-button" href={href(result.number+2)}>다음 페이지</Link>}</nav>}
  </>}
 </main>
}
