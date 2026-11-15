'use client'

import RestaurantCard from '@/app/(app)/restaurant/RestaurantCard'
import { Breadcrumb, PageHeading } from '@/components/krds/PageHeading'
import { TRestaurant } from '@/data/types'
import { useBookmarkScroll } from '@/lib/bookmarkScroll'

const listHref = '/dormitory/gyungdong'

export default function RestaurantList({ listings }: { listings: TRestaurant[] }) {
  useBookmarkScroll(listHref, true, 'restaurant-card-')
  return <main id="main-content" className="kr-container py-8 sm:py-12">
    <Breadcrumb current="경동파크타워 인근 맛집" />
    <PageHeading title="경동파크타워 인근 맛집" description="합숙소 주변에서 함께 즐기기 좋은 등록 식당을 모았습니다." />
    <p className="kr-muted mb-6">합숙소 주소: 부산 부산진구 새싹로 30</p>
    <p className="kr-search-summary" role="status">등록 식당 <strong>{listings.length}곳</strong></p>
    {listings.length ? <div className="kr-recommend-grid">{listings.map(item => <RestaurantCard key={item.restaurantId} data={item} listHref={listHref} />)}</div> : <p className="kr-empty">등록된 식당이 없습니다.</p>}
  </main>
}
