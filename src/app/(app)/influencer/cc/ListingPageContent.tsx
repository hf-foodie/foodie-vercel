'use client'

import RestaurantCard from '@/app/(app)/influencer/cc/RestaurantCard'
import PageHeader from '@/components/krds/RecommendationHeader'
import RecommendationSearch from '@/components/krds/RecommendationSearch'
import PaginationWrapper from '@/components/PaginationWrapper'
import { TFootprintsCC, TListFilterOptions } from '@/data/types'
import { useSearchParams } from 'next/navigation'
import { restaurantListHref } from '@/lib/restaurantNavigation'
import { useBookmarkScroll } from '@/lib/bookmarkScroll'

const ListingPageContent = ({
  listings,
  filterOptions,
}: {
  listings: TFootprintsCC[]
  filterOptions: TListFilterOptions
}) => {
  const searchParams = useSearchParams()
  const listHref=restaurantListHref('/influencer/cc',searchParams)
  useBookmarkScroll(listHref,true,'recommendation-card-')
  const requestedPage = Number(searchParams.get('page'))
  const currentPage = Number.isSafeInteger(requestedPage) && requestedPage > 0 ? requestedPage : 1
  const q = (searchParams.get('q') || '').toLowerCase().trim()

  const filteredListings = listings.filter((l) => {
    // 1. 검색어 필터링
    if (q) {
      const matchQ = [l.name, l.originalName, l.address, ...(l.representativeMenuNames || [])]
        .filter(Boolean)
        .some((field) => String(field).toLowerCase().includes(q))
      if (!matchQ) return false
    }

    return true
  })
  const itemsPerPage = 8
  const totalPages = Math.ceil(filteredListings.length / itemsPerPage)

  const currentListings = filteredListings.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  return (
    <main className="kr-container kr-main kr-recommend">
      <PageHeader></PageHeader>

      <div className="mt-6">
        <RecommendationSearch />
        <p className="kr-search-summary" role="status">
          추천 맛집 <strong>{filteredListings.length}곳</strong>
        </p>
        {currentListings.length === 0 && (
          <div className="kr-empty">표시할 추천이 없습니다. 검색 조건이나 페이지를 확인해 주세요.</div>
        )}
        <div className="kr-recommend-grid">
          {currentListings.map((listing, index) => (
            <RestaurantCard key={listing.restaurantId} data={listing} listHref={listHref} cardId={String(listing.restaurantId)+'-'+index} />
          ))}
        </div>
        <div className="mt-16 flex items-center justify-center">
          {totalPages > 1 && <PaginationWrapper totalPages={totalPages} />}
        </div>
      </div>
    </main>
  )
}
export default ListingPageContent
