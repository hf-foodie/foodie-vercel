'use client'
import { TRestaurant } from '@/data/types'
import RestaurantCard from '@/app/(app)/restaurant/RestaurantCard'
import { matchesRestaurant } from '@/lib/restaurantSearch'
import { restaurantListHref } from '@/lib/restaurantNavigation'
import { useBookmarkScroll } from '@/lib/bookmarkScroll'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useState } from 'react'

export default function RegisteredRestaurants({ restaurants, query }: { restaurants: TRestaurant[]; query: string }) {
  const params = useSearchParams()
  const router = useRouter()
  const office = params.get('office') || ''
  const [selectedOffice, setSelectedOffice] = useState(office)
  const offices = [...new Set(restaurants.flatMap(item => item.nearOfficeNames || []))].sort((a,b) => a.localeCompare(b,'ko'))
  const matches = restaurants.filter(item => matchesRestaurant(item, query, office) && ['region','address'].every(key => !params.get(key) || item.address.toLowerCase().includes(params.get(key)!.trim().toLowerCase())) && (!params.get('restaurantName') || item.name.toLowerCase().includes(params.get('restaurantName')!.trim().toLowerCase())))
  const totalPages = Math.ceil(matches.length / 8)
  const requested = Number(params.get('restaurantPage'))
  const page = Math.min(Number.isSafeInteger(requested) && requested > 0 ? requested : 1, Math.max(1,totalPages))
  const listHref = restaurantListHref('/search',params)
  useBookmarkScroll(listHref,true,'restaurant-card-')
  const href = (page: number) => { const next = new URLSearchParams(params.toString()); next.set('restaurantPage',String(page)); return '/search?'+next }
  return <section aria-label="등록 식당 검색 결과" className="mb-10 rounded-xl border p-4 sm:p-6">
    <h2 className="text-2xl font-bold">등록 식당</h2>
    <p className="kr-muted my-3">후기가 없는 식당도 상단 검색어로 상호·주소·대표 메뉴를 찾을 수 있습니다.</p>
    <form className="mb-5 flex flex-wrap items-end gap-3" onSubmit={event => { event.preventDefault(); const next = new URLSearchParams(params.toString()); if(selectedOffice) next.set('office',selectedOffice); else next.delete('office'); next.set('restaurantPage','1'); router.push('/search?'+next) }}>
      <label className="min-w-0">등록 식당 인근 부점<select className="mt-1 block max-w-full rounded border p-3" value={selectedOffice} onChange={event => setSelectedOffice(event.target.value)}><option value="">전체 부점</option>{offices.map(name => <option key={name} value={name}>{name}</option>)}</select></label>
      <button className="kr-button">부점 적용</button>
    </form>
    <p className="kr-search-summary" role="status">등록 식당 <strong>{matches.length}곳</strong>{office && ` · ${office}`}{totalPages > 0 && ` · ${page} / ${totalPages}페이지`}</p>
    {!matches.length ? <p className="kr-empty">조건에 맞는 등록 식당이 없습니다.</p> : <div className="kr-recommend-grid">{matches.slice((page-1)*8,page*8).map(item => <RestaurantCard key={item.restaurantId} data={item} listHref={listHref}/>)}</div>}
    {totalPages>1 && <nav aria-label="등록 식당 페이지" className="mt-6 flex flex-wrap justify-center gap-2">
      {page>1 && <Link className="kr-button" href={href(page-1)}>이전 식당</Link>}
      {Array.from({length:Math.min(5,totalPages)},(_,i)=>Math.max(1,Math.min(page-2,totalPages-4))+i).map(value => <Link className="kr-button" key={value} href={href(value)} aria-label={`등록 식당 ${value}페이지`} aria-current={page===value?'page':undefined}>{value}</Link>)}
      {page<totalPages && <Link className="kr-button" href={href(page+1)}>다음 식당</Link>}
    </nav>}
  </section>
}
