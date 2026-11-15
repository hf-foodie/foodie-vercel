'use client'

import PaginationWrapper from '@/components/PaginationWrapper'
import DirectoryFilters from '@/components/krds/DirectoryFilters'
import { Breadcrumb, PageHeading } from '@/components/krds/PageHeading'
import { TBlackWhite, TListFilterOptions } from '@/data/types'
import { useSearchParams } from 'next/navigation'
import { restaurantListHref } from '@/lib/restaurantNavigation'
import { useBookmarkScroll } from '@/lib/bookmarkScroll'
import RestaurantCard from './RestaurantCard'

const ListingPageContent = ({
  listings,
  filterOptions,
}: {
  listings: TBlackWhite[]
  filterOptions: TListFilterOptions
}) => {
  const searchParams = useSearchParams()
  const listHref=restaurantListHref('/blackwhite',searchParams)
  useBookmarkScroll(listHref,true,'blackwhite-card-')
  const requestedPage = Number(searchParams.get('page'))
  const currentPage = Number.isSafeInteger(requestedPage) && requestedPage > 0 ? requestedPage : 1
  const q = (searchParams.get('q') || '').toLowerCase().trim()

  const seasonFilters = searchParams.getAll('season[]')
  const spoonClassFilters = searchParams.getAll('spoonClass[]')

  const filteredListings = listings.filter((l) => {
    // 1. 검색어 필터링
    if (q) {
      const matchQ = [l.linkedRestaurant?.name, l.linkedRestaurant?.address, l.restaurantName, l.address, l.chefName, l.nickname]
        .filter(Boolean)
        .some((field) => String(field).toLowerCase().includes(q))
      if (!matchQ) return false
    }

    // 2. 시즌 필터링
    if (seasonFilters.length > 0) {
      const matchSeason = seasonFilters.includes(String(l.season))
      if (!matchSeason) return false
    }

    // 3. 수저(Spoon Class) 필터링
    if (spoonClassFilters.length > 0) {
      const matchSpoonClass = spoonClassFilters.includes(l.spoonClass)
      if (!matchSpoonClass) return false
    }

    return true
  })
  const itemsPerPage = 8
  const totalPages = Math.ceil(filteredListings.length / itemsPerPage)

  const currentListings = filteredListings.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  return (
    <main className="kr-container kr-main">
      <Breadcrumb current="흑백요리사 맛집" />
      <PageHeading title="흑백요리사 맛집" description="시즌과 수저 분류로 셰프의 식당을 찾아보세요." />

      <div className="mt-6">
        <DirectoryFilters options={filterOptions} placeholder="식당명, 셰프, 별명, 주소 검색" />
        <p className="kr-search-summary" role="status">
          검색 결과 <strong>{filteredListings.length}곳</strong>
        </p>
        {currentListings.length === 0 && (
          <p className="kr-empty">검색 결과가 없습니다. 조건이나 페이지를 확인해 주세요.</p>
        )}
        <div className="kr-recommend-grid">
          {currentListings.map((listing) => (
            <RestaurantCard key={listing.bwId} data={listing} listHref={listHref} />
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
