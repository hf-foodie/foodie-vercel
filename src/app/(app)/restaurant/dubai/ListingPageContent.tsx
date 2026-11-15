'use client'

import RestaurantCard from '@/app/(app)/restaurant/RestaurantCard'
import PaginationWrapper from '@/components/PaginationWrapper'
import DirectoryFilters from '@/components/krds/DirectoryFilters'
import { Breadcrumb, PageHeading } from '@/components/krds/PageHeading'
import { TListFilterOptions, TRestaurant } from '@/data/types'
import { useSearchParams } from 'next/navigation'
import { restaurantListHref } from '@/lib/restaurantNavigation'
import { useBookmarkScroll as useRestaurantScroll } from '@/lib/bookmarkScroll'

const ListingPageContent = ({
  listings,
  filterOptions,
}: {
  listings: TRestaurant[]
  filterOptions: TListFilterOptions
}) => {
  const searchParams = useSearchParams()
  const listHref = restaurantListHref('/restaurant/dubai', searchParams)
  useRestaurantScroll(listHref, true, 'restaurant-card-')
  const requestedPage = Number(searchParams.get('page'))
  const currentPage = Number.isSafeInteger(requestedPage) && requestedPage > 0 ? requestedPage : 1
  const q = (searchParams.get('q') || '').toLowerCase().trim()

  const filteredListings = listings.filter((l) => {
    // 1. 검색어 필터링
    if (q) {
      const matchQ = [l.name, l.address, ...(l.representativeMenuNames || [])]
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
    <main className="kr-container kr-main">
      <Breadcrumb current="두쫀쿠 맛집" />
      <PageHeading title="두쫀쿠 맛집" description="두쫀쿠를 판매하는 식당과 카페를 찾아보세요." />

      <div className="mt-6">
        <DirectoryFilters />
        <p className="kr-search-summary" role="status">
          검색 결과 <strong>{filteredListings.length}곳</strong>
        </p>
        {currentListings.length === 0 && (
          <p className="kr-empty">검색 결과가 없습니다. 조건이나 페이지를 확인해 주세요.</p>
        )}
        <div className="kr-recommend-grid">
          {currentListings.map((listing) => (
            <RestaurantCard key={listing.restaurantId} data={listing} listHref={listHref} />
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
