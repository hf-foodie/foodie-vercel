'use client'

import PageHeader from '@/components/krds/RecommendationHeader'

import RestaurantCard from '@/app/(app)/influencer/intern/RestaurantCard'
import RecommendationSearch from '@/components/krds/RecommendationSearch'
import PaginationWrapper from '@/components/PaginationWrapper'
import { TInfluencerRestaurant, TListFilterOptions } from '@/data/types'
import { useSearchParams } from 'next/navigation'
import { restaurantListHref } from '@/lib/restaurantNavigation'
import { useBookmarkScroll } from '@/lib/bookmarkScroll'

const ListingPageContent = ({
  listings,
  filterOptions,
}: {
  listings: TInfluencerRestaurant[]
  filterOptions: TListFilterOptions
}) => {
  const searchParams = useSearchParams()
  const listHref=restaurantListHref('/influencer/intern',searchParams)
  useBookmarkScroll(listHref,true,'recommendation-card-')
  const requestedPage = Number(searchParams.get('page'))
  const currentPage = Number.isSafeInteger(requestedPage) && requestedPage > 0 ? requestedPage : 1
  const q = (searchParams.get('q') || '').toLowerCase().trim()
  const timeZoneFilters = searchParams.getAll('time-zone[]')
  const foodStyleFilters = searchParams.getAll('food-style[]')
  const hasTimeZoneFilter = timeZoneFilters.length > 0
  const hasFoodStyleFilter = foodStyleFilters.length > 0

  const filteredListings = listings.filter((l) => {
    // 1. 검색어 필터링
    if (q) {
      const matchQ = [l.linkedRestaurant?.name, l.linkedRestaurant?.address, l.title, l.branch, l.address, l.representative_menu]
        .filter(Boolean)
        .some((field) => String(field).toLowerCase().includes(q))
      if (!matchQ) return false
    }

    // 2. 점심/저녁 필터링
    if (hasTimeZoneFilter) {
      const matchLunch = timeZoneFilters.includes('lunch') && l.timeZoneCategory?.includes('점심')
      const matchDinner = timeZoneFilters.includes('dinner') && l.timeZoneCategory?.includes('저녁')
      if (timeZoneFilters.length > 0 && !matchLunch && !matchDinner) return false
    }

    // 3. 카테고리 필터링
    if (hasFoodStyleFilter) {
      const categoryMap: { [key: string]: string } = {
        'korean-food': '한식',
        'chinese-food': '중식',
        'japanese-food': '일식',
        'western-food': '양식',
      }
      const selectedValues = foodStyleFilters.map((v) => categoryMap[v] || v)
      const matchCategory = l.foodStyleCategory?.some((cat) => selectedValues.includes(cat))
      if (foodStyleFilters.length > 0 && !matchCategory) return false
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
        <RecommendationSearch intern />
        <p className="kr-search-summary" role="status">
          추천 맛집 <strong>{filteredListings.length}곳</strong>
        </p>
        {currentListings.length === 0 && (
          <div className="kr-empty">표시할 추천이 없습니다. 검색 조건이나 페이지를 확인해 주세요.</div>
        )}
        <div className="kr-recommend-grid">
          {currentListings.map((listing, index) => (
            <RestaurantCard key={listing.id} data={listing} listHref={listHref} cardId={String(listing.id)+'-'+index} />
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
