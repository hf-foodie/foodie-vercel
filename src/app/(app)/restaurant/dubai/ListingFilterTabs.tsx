'use client'

import { useEffect, useRef, useState } from 'react'
import Input from '@/shared/Input'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import {TListFilterOptions} from "@/data/types";


const ListingFilterTabs = ({
                             filterOptions = [],
                           }: {
  filterOptions?: TListFilterOptions
}) => {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  const [search, setSearch] = useState<string>(searchParams.get('q') || '')
  const debounceRef = useRef<number | null>(null)

  // Keep local state in sync when user navigates via back/forward
  useEffect(() => {
    const current = searchParams.get('q') || ''
    setSearch(current)
  }, [searchParams])

  // Debounce search typing and sync to URL (?q=)
  // Do not depend on searchParams here to avoid clearing page on pagination clicks
  useEffect(() => {
    if (debounceRef.current) {
      window.clearTimeout(debounceRef.current)
    }
    debounceRef.current = window.setTimeout(() => {
      const currentQInUrl = (searchParams.get('q') || '').trim()
      const nextQ = search.trim()

      // If q is unchanged, do nothing
      if (currentQInUrl === nextQ) return

      const params = new URLSearchParams(searchParams.toString())
      if (nextQ) {
        params.set('q', nextQ)
      } else {
        params.delete('q')
      }
      // reset pagination only when q changes
      params.delete('page')
      const query = params.toString()
      const url = query ? `${pathname}?${query}` : pathname

      window.requestAnimationFrame(() => {
        router.push(url, { scroll: false })
      })
    }, 300) as unknown as number

    return () => {
      if (debounceRef.current) {
        window.clearTimeout(debounceRef.current)
      }
    }
  }, [search, pathname, router])

  if (!filterOptions || filterOptions.length === 0) {
    return <div>No filter options available</div>
  }

  return (
      <div className="flex flex-wrap items-center md:gap-x-4 md:gap-y-2">
        {/* Search input aligned to the right end */}
        <div className="ms-auto mt-3 w-full md:mt-0 md:w-72">
          <label htmlFor="listing-search" className="sr-only">
            검색을 시작하세요
          </label>
          <Input
              id="listing-search"
              name="q"
              type="search"
              placeholder="식당명, 주소, 메뉴 등으로 검색해보세요"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className=""
          />
        </div>
      </div>
  )
}

export default ListingFilterTabs
