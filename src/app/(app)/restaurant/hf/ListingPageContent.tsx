'use client'

import RestaurantCard from '@/app/(app)/restaurant/RestaurantCard'
import PaginationWrapper from '@/components/PaginationWrapper'
import DirectoryFilters from '@/components/krds/DirectoryFilters'
import { Breadcrumb, PageHeading } from '@/components/krds/PageHeading'
import { TListFilterOptions, TRestaurant } from '@/data/types'
import { useSearchParams } from 'next/navigation'
import { restaurantListHref } from '@/lib/restaurantNavigation'
import { useBookmarkScroll as useRestaurantScroll } from '@/lib/bookmarkScroll'
import { matchesRestaurant } from '@/lib/restaurantSearch'

const ListingPageContent = ({
  listings,
  filterOptions,
}: {
  listings: TRestaurant[]
  filterOptions: TListFilterOptions
}) => {
  const searchParams = useSearchParams()
  const listHref = restaurantListHref('/restaurant/hf', searchParams)
  useRestaurantScroll(listHref, true, 'restaurant-card-')
  const requestedPage = Number(searchParams.get('page'))
  const currentPage = Number.isSafeInteger(requestedPage) && requestedPage > 0 ? requestedPage : 1
  const q = (searchParams.get('q') || '').toLowerCase().trim()
  const office = searchParams.get('office') || ''
  const offices = [...new Set(listings.flatMap(item => item.nearOfficeNames || []))].sort((a,b) => a.localeCompare(b,'ko'))

  const timeZoneFilters = searchParams.getAll('time-zone[]')
  const foodStyleFilters = searchParams.getAll('food-style[]')
  // 만약 URL에 파라미터가 없으면, 디폴트로 모두 true인 상태로 간주함.
  const hasTimeZoneFilter = timeZoneFilters.length > 0
  const hasFoodStyleFilter = foodStyleFilters.length > 0

  const filteredListings = listings.filter((l) => {
    if (!matchesRestaurant(l, q, office)) return false
    // 2. 점심/저녁 필터링
    if (hasTimeZoneFilter) {
      const matchLunch = timeZoneFilters.includes('lunch') && l.isLunch
      const matchDinner = timeZoneFilters.includes('dinner') && l.isDinner
      // 만약 둘 다 체크되지 않은 상태로 왔다면 (로직상 모두 체크로 변환되겠지만 방어 코드)
      // 혹은 체크된 조건 중 하나라도 만족하면 표시 (OR 조건)
      if (timeZoneFilters.length > 0 && !matchLunch && !matchDinner) return false
    } else {
      // 디폴트 옵션: 점심/저녁 둘 다 true인 데이터가 보여지게 (요구사항: 점심 체크->isLunch, 저녁 체크->isDinner)
      // 디폴트로 점심, 저녁 모두 체크된 상태라면 isLunch || isDinner 인 것을 보여줌
      if (!l.isLunch && !l.isDinner) return false
    }

    // 3. 카테고리 필터링
    if (hasFoodStyleFilter) {
      const categoryMap: { [key: string]: string } = {
        'korean-food': '한식',
        'chinese-food': '중식',
        'japanese-food': '일식',
        'western-food': '양식',
        'asian-food': '아시안식',
        cafe: '카페',
      }
      const selectedValues = foodStyleFilters.map((v) => categoryMap[v] || v)
      // l.category가 "한식"과 같이 문자열이거나 ["한식", "일식"]과 같은 배열일 경우 모두 대응
      const matchCategory = Array.isArray(l.category)
        ? l.category.some((cat) => selectedValues.includes(cat))
        : selectedValues.includes(l.category)

      if (foodStyleFilters.length > 0 && !matchCategory) return false
    }

    return true
  })
  const itemsPerPage = 8
  const totalPages = Math.ceil(filteredListings.length / itemsPerPage)

  const currentListings = filteredListings.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  return (
    <main className="kr-container kr-main">
      <Breadcrumb current="주금공 맛집" />
      <PageHeading title="주금공 맛집" description="점심·저녁에 이용할 수 있는 식당과 대표 메뉴를 찾아보세요." />

      <div className="mt-6">
        <DirectoryFilters options={filterOptions} offices={offices} />
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
