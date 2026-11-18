'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { restaurantListHref, restaurantReviewsHref } from '@/lib/restaurantNavigation'
import { saveBookmarkPosition, useBookmarkScroll } from '@/lib/bookmarkScroll'
import { clientFetch } from '@/lib/clientFetch'
import RestaurantPhoto from '@/components/krds/RestaurantPhoto'
import { Breadcrumb, PageHeading } from '@/components/krds/PageHeading'
type Entry={restaurantId:number;name:string;address:string;rank:number;score:number;views:number;likes:number;bookmarks:number;participants:number;change:string}
type Report={weekStart:string;weekEnd:string;generatedAt:string|null;collectedFrom:string;finalized:boolean;entries:Entry[];offices:string[];preview:boolean}
export default function WeeklyRanking({compact=false}:{compact?:boolean}) {
 const params=useSearchParams()
 const period=!compact&&params.get('period')==='previous'?'previous':'current'
 const office=compact?'':(params.get('office')||'').slice(0,100)
 const [retry,setRetry]=useState(0)
 const listHref=restaurantListHref('/ranking',new URLSearchParams({period,...(office?{office}:{})}))
 function updateFilters(nextPeriod:string,nextOffice:string){
  window.history.replaceState(null,'',restaurantListHref('/ranking',new URLSearchParams({period:nextPeriod,...(nextOffice?{office:nextOffice}:{})})))
 }
 const key=period+':'+office+':'+retry
 const [result,setResult]=useState<{key:string;data?:Report;error?:string}|null>(null)
 useEffect(()=>{const controller=new AbortController();void clientFetch('/rankings/weekly?'+new URLSearchParams({period,office}),{signal:controller.signal}).then(async r=>{if(!r.ok)throw Error('주간 랭킹을 불러오지 못했습니다.');return r.json()}).then(data=>{if(!controller.signal.aborted)setResult({key,data})}).catch(e=>{if(!controller.signal.aborted)setResult({key,error:e.message})});return()=>controller.abort()},[key,period,office])
 const data=result?.key===key?result.data:undefined,error=result?.key===key?result.error:undefined
 useBookmarkScroll(listHref,!compact&&!!data,'ranking-restaurant-')
 const body=<>
  {compact?<div className="kr-section-heading"><h2>이번 주 인기 맛집 TOP 3</h2><Link className="kr-link" href="/ranking">전체 랭킹 →</Link></div>:<><Breadcrumb current="주간 맛집 랭킹"/><PageHeading title="주간 맛집 랭킹" description="이번 주 동료들이 찾고, 좋아하고, 저장한 맛집입니다."/></>}
  {!compact&&<div className="kr-panel my-5 flex flex-wrap gap-4"><label>집계 주차<select className="ml-2 rounded border p-3" value={period} onChange={e=>updateFilters(e.target.value,office)}><option value="current">이번 주</option><option value="previous">지난주</option></select></label><label>본사·지사<select className="ml-2 max-w-full rounded border p-3" value={office} onChange={e=>updateFilters(period,e.target.value)}><option value="">전체</option>{(result?.data?.offices||[]).map(o=><option key={o}>{o}</option>)}</select></label></div>}
  {!data&&!error&&<p role="status">주간 랭킹을 불러오는 중입니다.</p>}
  {error&&<div role="alert"><p>{error}</p><button className="kr-button" onClick={()=>setRetry(x=>x+1)}>다시 시도</button></div>}
  {data&&<>
   <p className="kr-muted my-4">{data.weekStart} ~ {data.weekEnd} · 한국 시간 · {data.preview?'정적 체험 자료':data.finalized?'확정 순위':'매시간 갱신'}{data.generatedAt&&' · 갱신 '+new Date(data.generatedAt).toLocaleString('ko-KR',{timeZone:'Asia/Seoul'})}</p>
   {!data.entries.length?<div className="kr-panel"><strong>아직 순위 진입 조건을 충족한 맛집이 없습니다.</strong><p className="mt-2">서로 다른 회원 3명 이상이 반응하면 표시됩니다. 도입 이전 누적 수치는 주간 점수로 사용하지 않습니다.</p>{data.preview&&<p className="mt-2">체험판의 클릭은 실제 순위에 반영되지 않습니다. 정식 서비스의 주간 집계 자료가 준비되면 정적 자료로 갱신합니다.</p>}</div>:<ol className="grid items-stretch gap-5 md:grid-cols-3">{data.entries.slice(0,compact?3:10).map(row=><li id={'ranking-restaurant-'+row.restaurantId} data-restaurant-id={row.restaurantId} className="kr-panel flex min-w-0 flex-col gap-3" key={row.restaurantId}><div className="flex justify-between gap-3"><strong>{row.rank}위</strong><span>{row.change==='FIRST'?'첫 집계':row.change==='NEW'?'신규 진입':Number(row.change)>0?'▲ '+row.change:Number(row.change)<0?'▼ '+Math.abs(Number(row.change)):'순위 유지'}</span></div><RestaurantPhoto restaurantId={row.restaurantId} title={row.name} fallbackSrc="/images/placeholder.png"/><h3 className="text-xl font-bold break-words">{row.name}</h3><p className="kr-muted break-words">{row.address}</p><p><strong>{row.score}점</strong> · 참여 {row.participants}명</p><p className="text-sm">유효 조회 {row.views}회 · 좋아요 {row.likes}명 · 새로 저장 {row.bookmarks}명</p><Link className="kr-button mt-auto" href={compact?'/records?restaurantId='+row.restaurantId:restaurantReviewsHref(row.restaurantId,listHref)} onClick={event=>{
     if(compact||event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return
     window.history.replaceState(null,'',listHref)
     const card=event.currentTarget.closest('li')
     if(card)saveBookmarkPosition(listHref,row.restaurantId,card)
    }}>후기 찾기</Link></li>)}</ol>}
   {!compact&&<section className="kr-panel mt-6"><h2 className="text-xl font-bold">집계 기준</h2><p className="mt-3">월요일 00시~일요일 24시 · 조회 1점, 좋아요 3점, 북마크 5점. 회원·식당별 조회는 하루 1회, 좋아요·북마크는 주간 1회입니다. 비로그인 조회와 본인 후기 반응은 제외합니다.</p><p className="mt-3">이번 주 신규 좋아요·저장을 취소하면 점수가 제외되며 반복 등록으로 추가 점수를 얻을 수 없습니다. 지난주부터 유지된 반응은 이번 주 신규 점수가 아닙니다. 동점은 북마크·좋아요·조회 참여자 수 순으로 정합니다.</p><p className="mt-3">숨김·삭제된 후기와 폐업·삭제 식당은 노출에서 제외합니다. 지난주 결과는 확정 후 보관합니다. 수집 시작: {new Date(data.collectedFrom).toLocaleDateString('ko-KR',{timeZone:'Asia/Seoul'})}.</p></section>}
  </>}
 </>
 return compact?<section className="kr-home-section">{body}</section>:<main className="kr-container kr-main">{body}</main>
}
