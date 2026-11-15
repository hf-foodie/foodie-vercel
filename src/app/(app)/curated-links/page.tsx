'use client'

import NewRestaurantForm, { type Registration } from './NewRestaurantForm'
import AdminNavigation from '@/components/krds/AdminNavigation'
import { Breadcrumb, PageHeading } from '@/components/krds/PageHeading'
import { clientFetch } from '@/lib/clientFetch'
import { useEffect, useRef, useState } from 'react'

type Restaurant = { restaurantId: number; name: string; address: string }
type Item = { source: 'blackwhite' | 'intern'; id: string; title: string; address: string; revision: number; restaurant: Restaurant | null }
type History = { revision: number; before: Restaurant | null; after: Restaurant | null; actor: string; reason: string; changedAt: string; createdRestaurant: boolean }
type Page<T> = { content: T[]; page: number; size: number; totalElements: number }
class ApiError extends Error { constructor(message: string, public status: number) { super(message) } }
async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await clientFetch('/curated-links' + path, options)
  const body = await response.json().catch(() => null)
  if (!response.ok) throw new ApiError(body?.message || '요청을 처리하지 못했습니다. 다시 시도해주세요.', response.status)
  return body as T
}
const sourceName = (source: string) => source === 'blackwhite' ? '흑백요리사' : '인턴 추천'
const messageOf = (error: unknown) => error instanceof Error ? error.message : '요청을 처리하지 못했습니다.'
function RestaurantInfo({ value }: { value: Restaurant | null }) {
  return value ? <><p className="font-bold">{value.name} <span className="text-sm font-normal">(식당 번호 {value.restaurantId})</span></p><p className="break-words text-sm">{value.address}</p></> : <p>연결 없음</p>
}
function Paging({ data, label, disabled, onPage }: { data: {page:number;size:number;totalElements:number}; label:string; disabled?:boolean; onPage:(page:number)=>void }) {
  return <nav aria-label={label+' 페이지 이동'} className="mt-4 flex flex-wrap items-center gap-3">
    <button className="kr-button" disabled={disabled || data.page === 0} onClick={()=>onPage(data.page-1)}>{label} 이전</button>
    <span>{data.page+1} / {Math.max(1,Math.ceil(data.totalElements/data.size))}페이지</span>
    <button className="kr-button" disabled={disabled || (data.page+1)*data.size >= data.totalElements} onClick={()=>onPage(data.page+1)}>{label} 다음</button>
  </nav>
}
export default function CuratedLinksPage() {
  const [filters,setFilters]=useState({source:'all',status:'unlinked',q:'',page:0})
  const [search,setSearch]=useState('')
  const [list,setList]=useState<Page<Item>|null>(null)
  const [loading,setLoading]=useState(true)
  const [denied,setDenied]=useState(false)
  const [error,setError]=useState('')
  const [notice,setNotice]=useState('')
  const [refresh,setRefresh]=useState(0)
  const [selected,setSelected]=useState<Item|null>(null)
  const [draft,setDraft]=useState<Restaurant|null|undefined>(undefined)
  const [reason,setReason]=useState('')
  const [busy,setBusy]=useState(false)
  const [showRegistration,setShowRegistration]=useState(false)
  const saving=useRef(false)
  const editor=useRef<HTMLElement>(null)
  const [restaurantSearch,setRestaurantSearch]=useState('')
  const [candidateQuery,setCandidateQuery]=useState({q:'',page:0})
  const [candidates,setCandidates]=useState<Page<Restaurant>|null>(null)
  const [candidateLoading,setCandidateLoading]=useState(false)
  const [candidateError,setCandidateError]=useState('')
  const [history,setHistory]=useState<Page<History>|null>(null)
  const [historyPage,setHistoryPage]=useState(0)
  const [historyError,setHistoryError]=useState('')
  const [historyRefresh,setHistoryRefresh]=useState(0)
  useEffect(()=>{
    const controller=new AbortController()
    request<Page<Item>>('?'+new URLSearchParams({...filters,page:String(filters.page)}),{signal:controller.signal})
      .then(data=>{if(!controller.signal.aborted){setList(data);setDenied(false)}})
      .catch(e=>{if(!controller.signal.aborted){setList(null);setError(messageOf(e));setDenied(e instanceof ApiError && [401,403].includes(e.status))}})
      .finally(()=>{if(!controller.signal.aborted)setLoading(false)})
    return ()=>controller.abort()
  },[filters,refresh])
  useEffect(()=>{
    if(!selected)return
    const controller=new AbortController()
    request<Page<Restaurant>>('/restaurants?'+new URLSearchParams({q:candidateQuery.q,page:String(candidateQuery.page)}),{signal:controller.signal})
      .then(data=>{if(!controller.signal.aborted)setCandidates(data)})
      .catch(e=>{if(!controller.signal.aborted)setCandidateError(messageOf(e))})
      .finally(()=>{if(!controller.signal.aborted)setCandidateLoading(false)})
    return ()=>controller.abort()
  },[candidateQuery,selected])
  useEffect(()=>{
    if(!selected)return
    const controller=new AbortController()
    request<Page<History>>(`/${selected.source}/${encodeURIComponent(selected.id)}/history?page=${historyPage}`,{signal:controller.signal})
      .then(data=>{if(!controller.signal.aborted)setHistory(data)})
      .catch(e=>{if(!controller.signal.aborted)setHistoryError(messageOf(e))})
    return ()=>controller.abort()
  },[selected,historyPage,historyRefresh])
  function changeFilters(next: typeof filters) { setLoading(true);setError('');setFilters(next) }
  function refreshList() { setLoading(true);setError('');setRefresh(x=>x+1) }
  function changeCandidateQuery(next: typeof candidateQuery) { setCandidates(null);setCandidateError('');setCandidateLoading(true);setCandidateQuery(next) }
  function changeHistoryPage(page:number) { setHistory(null);setHistoryError('');setHistoryPage(page) }
  function choose(item:Item) {
    setShowRegistration(false);setSelected(item);setDraft(undefined);setReason('');setNotice('');setError('');changeHistoryPage(0)
    setRestaurantSearch('');changeCandidateQuery({q:'',page:0})
    requestAnimationFrame(()=>editor.current?.scrollIntoView({block:'start'}))
  }
  async function reloadSelected() {
    if(!selected || saving.current)return
    saving.current=true;setBusy(true)
    try {choose(await request<Item>(`/${selected.source}/${encodeURIComponent(selected.id)}`));refreshList()}
    catch(e){setError(messageOf(e))}finally{saving.current=false;setBusy(false)}
  }
  async function save(event:React.FormEvent) {
    event.preventDefault()
    if(!selected || draft===undefined || saving.current)return
    saving.current=true;setBusy(true);setError('');setNotice('')
    try {
      const saved=await request<Item>(`/${selected.source}/${encodeURIComponent(selected.id)}`,{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({revision:selected.revision,restaurantId:draft?.restaurantId??null,reason:reason.trim()})})
      setSelected(saved);setDraft(undefined);setReason('');changeHistoryPage(0);refreshList()
      setNotice(saved.restaurant?'식당 연결을 저장했습니다. 추천 페이지에 바로 반영됩니다.':'식당 연결을 해제했습니다. 변경 이력이 보관됩니다.')
    }catch(e){setError(e instanceof ApiError && e.status===409?'다른 담당자가 먼저 변경했습니다. 최신 연결 불러오기를 누른 뒤 다시 확인해주세요.':messageOf(e))}
    finally{saving.current=false;setBusy(false)}
  }
  async function register(value: Registration) {
    if(!selected || saving.current) return
    saving.current=true;setBusy(true);setError('');setNotice('')
    try {
      const saved=await request<Item>('/'+selected.source+'/'+encodeURIComponent(selected.id)+'/registrations',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({...value,revision:selected.revision})})
      setSelected(saved);setDraft(undefined);setReason('');setShowRegistration(false);changeHistoryPage(0);refreshList()
      setNotice('새 식당을 등록하고 추천에 연결했습니다. 등록·연결 이력이 보관됩니다.')
    } finally {saving.current=false;setBusy(false)}
  }
  const changed=draft!==undefined && (draft?.restaurantId??null)!==(selected?.restaurant?.restaurantId??null)
  return <main className="kr-container kr-main kr-admin">
    <Breadcrumb current="추천 식당 연결 관리"/><PageHeading title="추천 식당 연결 관리" description="흑백요리사·인턴 추천을 등록된 식당과 연결하면 정확한 후기를 볼 수 있습니다."/><AdminNavigation/>
    {error&&!selected&&<p role="alert" className="my-4 break-words text-red-700">{error}</p>}
    {notice&&!selected&&<p role="status" className="my-4 text-blue-700">{notice}</p>}
    {denied?<section className="kr-panel mt-5"><p>매니저와 관리자만 식당 연결과 변경 이력을 관리할 수 있습니다.</p><a className="kr-link" href="/login">로그인</a></section>:<>
    <form className="kr-panel mt-5" onSubmit={e=>{e.preventDefault();changeFilters({...filters,q:search.trim(),page:0})}}>
      <fieldset disabled={busy} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <label>추천 분류<select className="mt-1 block w-full rounded border p-3" value={filters.source} onChange={e=>changeFilters({...filters,source:e.target.value,page:0})}><option value="all">전체 분류</option><option value="blackwhite">흑백요리사</option><option value="intern">인턴 추천</option></select></label>
        <label>연결 상태<select className="mt-1 block w-full rounded border p-3" value={filters.status} onChange={e=>changeFilters({...filters,status:e.target.value,page:0})}><option value="unlinked">미연결</option><option value="linked">연결됨</option><option value="all">전체 상태</option></select></label>
        <label className="lg:col-span-2">추천 식당 검색<div className="mt-1 flex gap-2"><input aria-label="추천 식당 검색" type="search" maxLength={200} className="min-w-0 flex-1 rounded border p-3" value={search} onChange={e=>setSearch(e.target.value)} placeholder="식당명 또는 주소"/><button className="kr-button" type="submit">추천 검색</button></div></label>
      </fieldset>
    </form>
    <section className="mt-6" aria-label="추천 식당 목록" aria-busy={loading}>
      <h2 className="text-xl font-bold">관리할 추천 식당 {list&&!loading&&<span>({list.totalElements}곳)</span>}</h2>
      {loading?<p role="status">불러오는 중입니다…</p>:list?<>
        {!list.content.length&&<p className="kr-panel mt-3">검색 조건에 맞는 추천이 없습니다.</p>}
        <div className="mt-4 grid gap-4 lg:grid-cols-2">{list.content.map(item=><article key={item.source+item.id} className="kr-panel min-w-0 space-y-2">
          <p className="kr-muted">{sourceName(item.source)} · {item.restaurant?'연결됨':'미연결'}</p><h3 className="text-lg font-bold">{item.title}</h3><p className="break-words">{item.address}</p>
          {item.restaurant&&<div className="rounded bg-neutral-50 p-3 dark:bg-neutral-800"><RestaurantInfo value={item.restaurant}/></div>}
          <button className="kr-button" disabled={busy} aria-label={item.title+' 연결 관리'} onClick={()=>choose(item)}>연결 관리</button>
        </article>)}</div>
        <Paging data={list} label="추천 목록" disabled={busy} onPage={page=>changeFilters({...filters,page})}/>
      </>:<button className="kr-button" onClick={()=>refreshList()}>추천 목록 다시 불러오기</button>}
    </section>
    {selected&&<section ref={editor} aria-label="식당 연결 편집" className="kr-panel mt-8 scroll-mt-6 space-y-5">
      <h2 className="text-xl font-bold">{selected.title} 연결 관리</h2><p>{sourceName(selected.source)} · {selected.address}</p>
      <div className="rounded border p-4"><h3 className="mb-2 font-bold">현재 연결</h3><RestaurantInfo value={selected.restaurant}/></div>
      <p>식당명뿐 아니라 주소와 지점을 확인한 뒤 선택해주세요. 저장하면 후기 연결이 즉시 변경됩니다.</p>
      <form onSubmit={e=>{e.preventDefault();changeCandidateQuery({q:restaurantSearch.trim(),page:0})}} className="flex flex-wrap gap-2">
        <label className="min-w-0 flex-1">등록 식당 검색<input type="search" maxLength={200} disabled={busy} value={restaurantSearch} onChange={e=>setRestaurantSearch(e.target.value)} placeholder="등록된 식당명 또는 주소" className="mt-1 block w-full rounded border p-3"/></label><button disabled={busy} className="kr-button self-end" type="submit">식당 검색</button>
      </form>
      {candidateError&&<p role="alert">{candidateError}</p>}
      {candidateLoading?<p role="status">등록 식당을 검색하는 중입니다…</p>:candidates&&<>
        <p>등록 식당 검색 결과 {candidates.totalElements}곳</p>
        <fieldset disabled={busy} className="grid gap-3 lg:grid-cols-2"><legend className="sr-only">연결할 등록 식당 선택</legend>{candidates.content.map(r=><label key={r.restaurantId} className="flex min-w-0 cursor-pointer items-start gap-3 rounded border p-4"><input type="radio" name="targetRestaurant" className="mt-1" aria-label={`${r.name} (${r.restaurantId}) 선택`} checked={draft?.restaurantId===r.restaurantId} onChange={()=>{setShowRegistration(false);setDraft(r)}}/><span className="min-w-0"><span className="block font-bold">{r.name} · {r.restaurantId}</span><span className="block break-words text-sm">{r.address}</span></span></label>)}</fieldset>
        {!candidates.content.length&&<p>일치하는 등록 식당이 없습니다. 이름 또는 주소를 바꿔 검색해주세요.</p>}
        <Paging data={candidates} label="등록 식당" disabled={busy} onPage={page=>changeCandidateQuery({...candidateQuery,page})}/>
      </>}
      <div className="flex flex-wrap gap-3"><button className="kr-button" disabled={busy||!selected.restaurant} onClick={()=>{setShowRegistration(false);setDraft(null)}}>연결 해제 선택</button><button className="kr-button" disabled={busy} onClick={reloadSelected}>최신 연결 불러오기</button></div>
      <button type="button" className="kr-button" disabled={busy} aria-expanded={showRegistration} onClick={()=>{setShowRegistration(true);setDraft(undefined);setError('');setNotice('')}}>찾는 식당이 없나요? 새 식당 등록 후 연결</button>
      {showRegistration&&<NewRestaurantForm key={selected.source+selected.id+selected.revision} name={selected.title} address={selected.address} busy={busy} onSave={register} onExisting={r=>{setShowRegistration(false);setDraft(r)}} onCancel={()=>setShowRegistration(false)}/>}
      {error&&<p role="alert" className="break-words text-red-700">{error}</p>}
      {notice&&<p role="status" className="text-blue-700">{notice}</p>}
      {draft!==undefined&&<form onSubmit={save} className="space-y-4 border-t pt-5"><fieldset disabled={busy} className="space-y-4">
        <div><h3 className="font-bold">저장할 연결</h3><RestaurantInfo value={draft}/>{draft===null&&<p>해제하면 해당 추천의 후기 찾기 링크가 표시되지 않습니다.</p>}</div>
        <label className="block">변경 사유<textarea required maxLength={500} className="mt-1 block w-full rounded border p-3" rows={3} value={reason} onChange={e=>setReason(e.target.value)} placeholder="연결 근거 또는 해제 사유를 입력해주세요"/></label>
        <button type="submit" className="kr-button kr-button-primary" disabled={!changed||!reason.trim()}>{busy?'저장 중…':draft===null?'연결 해제 저장':'연결 저장'}</button>
      </fieldset></form>}
      <section aria-label="연결 변경 이력" className="space-y-3 border-t pt-5"><h3 className="text-lg font-bold">연결 변경 이력</h3>
        {historyError?<><p role="alert">{historyError}</p><button className="kr-button" onClick={()=>setHistoryRefresh(x=>x+1)}>이력 다시 불러오기</button></>:!history?<p>이력을 불러오는 중입니다…</p>:<>
          {!history.content.length&&<p>아직 연결 변경 이력이 없습니다.</p>}
          {history.content.map(h=><article key={h.revision} className="space-y-3 rounded border p-4"><p className="font-bold">{h.createdRestaurant?'식당 등록 및 연결':h.revision===0?'기존 연결':h.after?(h.before?'연결 변경':'신규 연결'):'연결 해제'} · {h.actor}</p><time>{new Date(h.changedAt).toLocaleString('ko-KR')}</time><div className="grid gap-3 sm:grid-cols-2"><div><h4 className="font-bold">변경 전</h4><RestaurantInfo value={h.before}/></div><div><h4 className="font-bold">변경 후</h4><RestaurantInfo value={h.after}/></div></div><p className="break-words whitespace-pre-wrap">사유: {h.reason}</p></article>)}
          <Paging data={history} label="변경 이력" disabled={busy} onPage={changeHistoryPage}/>
        </>}
      </section>
    </section>}
    </>}
  </main>
}
