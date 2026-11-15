'use client'
import { MagnifyingGlassIcon, AdjustmentsHorizontalIcon } from '@heroicons/react/24/outline'
import { branches } from '@/data/branches'
import SearchAutocomplete from '@/components/krds/SearchAutocomplete'
import { recordSearch } from '@/lib/searchAnalytics'

import CardSearch from '@/app/(app)/search/CardSearch'
import ArchiveSortByListBox from '@/components/ArchiveSortByListBox'
import ArchiveTabs from '@/components/ArchiveTabs'
import { Breadcrumb, PageHeading } from '@/components/krds/PageHeading'
import PaginationWrapper from '@/components/PaginationWrapper'
import { TPostSummary, TTag, TRestaurant } from '@/data/types'
import RegisteredRestaurants from './RegisteredRestaurants'
import { searchQuery as listQuery, searchListHref } from '@/lib/searchNavigation'
import { useSearchScroll } from '@/lib/searchScroll'
import { bookmarkReturnHref } from '@/lib/bookmarkNavigation'
import { restaurantReturnHref, restaurantListLabel } from '@/lib/restaurantNavigation'
import Link from 'next/link'
import Tag from '@/shared/Tag'
import Calendar01Icon from '@hugeicons/core-free-icons/dist/esm/Calendar01Icon'
import Comment01Icon from '@hugeicons/core-free-icons/dist/esm/Comment01Icon'
import FavouriteIcon from '@hugeicons/core-free-icons/dist/esm/FavouriteIcon'
import LicenseIcon from '@hugeicons/core-free-icons/dist/esm/LicenseIcon'
import Tag02Icon from '@hugeicons/core-free-icons/dist/esm/Tag02Icon'
import ViewIcon from '@hugeicons/core-free-icons/dist/esm/ViewIcon'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { FC, useState } from 'react'

const POSTS_PER_PAGE = 8

const sortByOptions = [
  { name: '등록순↓', value: 'most-recent', icon: Calendar01Icon },
  { name: '댓글순↓', value: 'most-comment', icon: Comment01Icon },
  { name: '조회수↓', value: 'most-viewed', icon: ViewIcon },
  { name: '좋아요↓', value: 'most-liked', icon: FavouriteIcon },
]
const filterTabs = [
  {
    name: '맛집 후기',
    value: 'posts',
    icon: LicenseIcon,
  },
  { name: '태그', value: 'tags', icon: Tag02Icon },
]

interface SearchClientProps {
  view?: 'restaurants' | 'blogs'
  filterSuggestions: { address: string[]; restaurantName: string[] }
  restaurants: TRestaurant[] | null
  filters: { region?: string; address?: string; restaurantName?: string; restaurantId?: string; tag?: string }
  posts: TPostSummary[]
  tags: TTag[]
  totalResults: number
  searchQuery: string
  searchTab: 'posts' | 'tags'
  currentPage: number
}

const SearchClient: FC<SearchClientProps> = ({
  view = 'blogs',
  filterSuggestions,
  posts: initialPosts,
  restaurants,
  filters,
  tags,
  totalResults,
  searchQuery,
  searchTab,
  currentPage,
}) => {
  const [searchMode, setSearchMode] = useState<'search' | 'filters'>('search')
  const [filterValues, setFilterValues] = useState(filters)
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const listHref = view === 'blogs' ? searchListHref(searchParams) : '/search' + listQuery(searchParams)
  const bookmarkHref = bookmarkReturnHref(searchParams.get('bookmarkReturn'))
  const restaurantHref = restaurantReturnHref(searchParams.get('restaurantReturn'))
  useSearchScroll(listHref, searchTab === 'posts')

  const [searchValue, setSearchValue] = useState(searchQuery)
  const filteredTags = tags.filter((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  const paginatedPosts = initialPosts
  const postsTotalPages = Math.ceil(totalResults / POSTS_PER_PAGE)

  const handleSearchSubmit = (e?: React.FormEvent) => {
    e?.preventDefault()
    const trimmedSearchValue = searchValue.trim()
    recordSearch(trimmedSearchValue, pathname)
    const params = new URLSearchParams(searchParams.toString())

    if (trimmedSearchValue) {
      params.set('s', trimmedSearchValue)
    } else {
      params.delete('s')
    }
    Object.entries(filterValues).forEach(([key, value]) => {
      if (value?.trim()) params.set(key, value.trim())
      else params.delete(key)
    })
    params.set('page', '1')
    params.set('restaurantPage', '1')
    router.push(`${pathname}?${params.toString()}`)
  }

  const renderLoopItems = () => {
    if (searchTab === 'posts' && paginatedPosts.length === 0) {
      return (
        <div className="kr-empty">
          <p className="text-neutral-500">검색 결과가 없습니다.</p>
        </div>
      )
    }

    if (searchTab === 'tags' && filteredTags.length === 0) {
      return (
        <div className="mt-12 text-center">
          <p className="text-neutral-500">검색 결과가 없습니다.</p>
        </div>
      )
    }

    switch (searchTab) {
      case 'tags':
        return (
          <div className="mt-12 flex flex-wrap gap-3">
            {filteredTags?.map((tag, index) => (
              <Tag key={index} href={`/records?tag=${encodeURIComponent(tag)}&tab=posts`}>
                {tag}
              </Tag>
            ))}
          </div>
        )

      default:
        return (
          <div className="kr-search-grid">
            {paginatedPosts.map((post) => (
              <CardSearch
                key={post.postId}
                post={post}
                listHref={listHref}
                detailHref={'/posts/' + post.postId + listQuery(searchParams)}
              />
            ))}
          </div>
        )
    }
  }

  return (
    <main className="kr-container kr-main">
      <Breadcrumb current={view === 'blogs' ? '맛집 후기' : '맛집탐방'} />
      {bookmarkHref && <Link href={bookmarkHref} className="kr-link mb-4 inline-flex">← 저장한 맛집으로 돌아가기</Link>}
      {!bookmarkHref && restaurantHref && <Link href={restaurantHref} className="kr-link mb-4 inline-flex">← {restaurantListLabel(restaurantHref)} 목록으로 돌아가기</Link>}
      <PageHeading title={view === 'blogs' ? '맛집 후기' : '맛집탐방'} description={view === 'blogs' ? '동료들의 맛집 후기를 읽고 태그별로 찾아보세요.' : '등록된 식당을 상호·대표 메뉴·지역으로 찾아보세요.'} />
      <div className="kr-search-mode-tabs" role="tablist" aria-label="검색 방식">
        {([['search', '검색'], ['filters', '필터']] as const).map(([mode, label], index) => (
          <button key={mode} id={`search-mode-${mode}`} type="button" role="tab"
            aria-selected={searchMode === mode} aria-controls={`search-panel-${mode}`}
            tabIndex={searchMode === mode ? 0 : -1} onClick={() => setSearchMode(mode)}
            onKeyDown={(event) => {
              if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return
              event.preventDefault()
              const next = event.key === 'Home' ? 'search' : event.key === 'End' ? 'filters' : index === 0 ? 'filters' : 'search'
              setSearchMode(next)
              document.getElementById(`search-mode-${next}`)?.focus()
            }}
          >{mode === 'search' ? <MagnifyingGlassIcon aria-hidden="true" className="size-5" /> : <AdjustmentsHorizontalIcon aria-hidden="true" className="size-5" />}{label}</button>
        ))}
      </div>
      <div id="search-panel-search" role="tabpanel" aria-labelledby="search-mode-search" hidden={searchMode !== 'search'}>
      <form onSubmit={handleSearchSubmit} className="kr-search-form" role="search">
        <label className="sr-only" htmlFor="s">
          {view === 'blogs' ? '식당명, 제목, 작성자 검색' : '식당명, 주소, 대표 메뉴 검색'}
        </label>
        <input
          id="s"
          type="search"
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          placeholder={view === 'blogs' ? '식당명, 제목, 작성자 검색' : '식당명, 주소, 대표 메뉴 검색'}
        />
        <button className="kr-button kr-button-primary">검색</button>
      </form>
      </div>
      <div id="search-panel-filters" role="tabpanel" aria-labelledby="search-mode-filters" hidden={searchMode !== 'filters'}>
          <form id="search-filters" onSubmit={handleSearchSubmit} className="kr-filter open kr-search-tab-filter">
            <h2>검색 조건</h2>
            <p className="mb-4 text-sm">{view === 'blogs' ? '맛집 후기에 적용됩니다.' : '등록 식당에 적용됩니다.'}</p>
            <label className="kr-region-field">지역
              <select className="kr-input" value={filterValues.region || ''}
                onChange={(event) => setFilterValues({ ...filterValues, region: event.target.value })}>
                <option value="">모두</option>
                {branches.map((branch) => <option key={branch.id} value={branch.handle}>{branch.name}</option>)}
              </select>
            </label>
            {(
              [
                ['address', '주소'],
                ['restaurantName', '식당명'],
                ['tag', '태그'],
              ] as const
            ).filter(([key]) => view === 'blogs' || key !== 'tag').map(([key, label]) => key !== 'tag' ? (
              <SearchAutocomplete key={key} className={`kr-${key}-field`} placeholder={key === 'address' ? '예: 남동천로 128, 부산 남구 문현금융로' : '예: 우동키노야'} label={label} value={filterValues[key] || ''} options={filterSuggestions[key]}
                onChange={(value) => setFilterValues({ ...filterValues, [key]: value })} />
            ) : (
              <label key={key} className="kr-tag-field">
                {label}
                <input
                  className="kr-input"
                  placeholder="예: #점심, #혼밥"
                  value={filterValues[key] || ''}
                  onChange={(e) => setFilterValues({ ...filterValues, [key]: e.target.value })}
                />
                <span className="mt-2 block text-sm font-normal">쉼표로 구분해 입력하세요. 입력한 태그 중 하나가 포함된 후기를 찾습니다.</span>
              </label>
            ))}
            <button className="kr-button kr-button-primary w-full" disabled={view === 'blogs' && searchTab !== 'posts'}>
              조건 적용
            </button>
            <button
              className="kr-filter-reset"
              type="button"
              onClick={() => {
                setFilterValues({})
                const params = new URLSearchParams(searchParams.toString())
                ;['region', 'address', 'restaurantName', 'tag'].forEach((key) => params.delete(key))
                params.set('page', '1')
                router.push(pathname + '?' + params)
              }}
            >
              조건 초기화
            </button>
          </form>
      </div>
      {restaurants && <RegisteredRestaurants restaurants={restaurants} query={searchQuery}/>}
      {view === 'blogs' && <div className="kr-search-results-layout">
        <section className="kr-results" aria-label="검색 결과">
          <div className="kr-result-controls">
            <ArchiveTabs tabs={filterTabs} />
            {searchTab === 'posts' && <ArchiveSortByListBox filterOptions={sortByOptions} />}
          </div>
          <p className="kr-search-summary">
            검색 결과 <strong>{searchTab === 'posts' ? totalResults : filteredTags.length}건</strong>
            {searchQuery && <> · “{searchQuery}”</>}
            {searchTab === 'posts' && <> · {currentPage}페이지</>}
          </p>
          {renderLoopItems()}
          {searchTab === 'posts' && postsTotalPages > 1 && (
            <PaginationWrapper className="mt-10" totalPages={postsTotalPages} />
          )}
        </section>
      </div>}
    </main>
  )
}
export default SearchClient
