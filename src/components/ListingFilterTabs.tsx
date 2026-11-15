'use client'

import { Button } from '@/shared/Button'
import ButtonPrimary from '@/shared/ButtonPrimary'
import ButtonThird from '@/shared/ButtonThird'
import { Checkbox, CheckboxField, CheckboxGroup } from '@/shared/Checkbox'
import { Description, Fieldset, Label } from '@/shared/fieldset'
import {
  CloseButton,
  Popover,
  PopoverButton,
  PopoverGroup,
  PopoverPanel,
} from '@headlessui/react'
import { ChevronDownIcon } from '@heroicons/react/24/outline'
import clsx from 'clsx'
import { useEffect, useRef, useState } from 'react'
import Input from '@/shared/Input'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import {TCheckboxFilter, TListFilterOptions} from "@/data/types";

  const CheckboxPanel = ({ filterOption, className, searchParams }: { filterOption: TCheckboxFilter; className?: string; searchParams: URLSearchParams }) => {
  const selectedValues = searchParams.getAll(`${filterOption.name}[]`)
  const hasSelectionInUrl = searchParams.has(`${filterOption.name}[]`)

  return (
    <Fieldset>
      <CheckboxGroup className={className}>
        {filterOption.options.map((option) => (
          <CheckboxField key={option.name}>
            <Checkbox
              name={`${filterOption.name}[]`}
              value={option.value}
              key={`${filterOption.name}-${option.value}-${hasSelectionInUrl ? selectedValues.join(',') : 'default'}`}
              defaultChecked={hasSelectionInUrl ? selectedValues.includes(option.value) : !!option.defaultChecked}
            />
            <Label>{option.name}</Label>
            {option.description && <Description>{option.description}</Description>}
          </CheckboxField>
        ))}
      </CheckboxGroup>
    </Fieldset>
  )
}

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

  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const params = new URLSearchParams(searchParams.toString())

    // Group checkboxes by name
    const checkboxNames = Array.from(new Set(filterOptions.filter(f => f.tabUIType === 'checkbox').map(f => `${f.name}[]`)))

    checkboxNames.forEach(name => {
      params.delete(name)
      let values = formData.getAll(name)
      
      // Special case: if 'time-zone[]' or 'food-style[]' is empty, check hf options
      if ((name === 'time-zone[]' || name === 'food-style[]') && values.length === 0) {
        const filterName = name.replace('[]', '');
        const filter = filterOptions.find(f => f.name === filterName) as TCheckboxFilter;
        if (filter) {
          values = filter.options.map(opt => opt.value);
        }
      }

      values.forEach(value => {
        params.append(name, value as string)
      })
    })

    params.delete('page')
    const query = params.toString()
    const url = query ? `${pathname}?${query}` : pathname
    
    // Use transition to avoid flushSync error during render/lifecycle
    window.requestAnimationFrame(() => {
        router.push(url, { scroll: false })
    })
  }

  const handleClearFilter = (filterName: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.delete(`${filterName}[]`)
    params.delete('page')
    const query = params.toString()
    const url = query ? `${pathname}?${query}` : pathname
    window.requestAnimationFrame(() => {
      router.push(url, { scroll: false })
    })
  }

  if (!filterOptions || filterOptions.length === 0) {
    return <div>No filter options available</div>
  }

  return (
    <div className="flex flex-wrap items-center md:gap-x-4 md:gap-y-2">
      <PopoverGroup className="hidden flex-wrap gap-x-4 gap-y-2 md:flex" as="form" onSubmit={handleFormSubmit}>
        {filterOptions.map((filterOption, index) => {
          if (!filterOption) {
            return null
          }

          const selectedValuesInUrl = searchParams.getAll(`${filterOption.name}[]`)
          const hasFilterInUrl = searchParams.has(`${filterOption.name}[]`)
          const checkedNumber = hasFilterInUrl
            ? selectedValuesInUrl.length
            : (filterOption as TCheckboxFilter).options?.filter((option) => !!option.defaultChecked)?.length || 0

          return (
            <Popover className="relative" key={index}>
              <PopoverButton
                as={Button}
                outline
                className={clsx(
                  'md:px-4',
                  checkedNumber &&
                    'border-black! ring-1 ring-black ring-inset dark:border-neutral-200! dark:ring-neutral-200'
                )}
              >
                <span>{filterOption.label}</span>
                <ChevronDownIcon className="size-4" />
                {checkedNumber ? (
                  <span className="absolute top-0 -right-0.5 flex size-5 items-center justify-center rounded-full bg-black text-[0.65rem] font-semibold text-white ring-2 ring-white dark:bg-neutral-200 dark:text-neutral-900 dark:ring-neutral-900">
                    {checkedNumber}
                  </span>
                ) : null}
              </PopoverButton>

              <PopoverPanel
                transition
                unmount={false}
                className="absolute -start-5 top-full z-10 mt-3 w-sm transition data-closed:translate-y-1 data-closed:opacity-0"
              >
                <div className="rounded-2xl border border-neutral-200 bg-white shadow-xl dark:border-neutral-700 dark:bg-neutral-900">
                  <div className="hidden-scrollbar max-h-[28rem] overflow-y-auto px-5 py-6">
                      <CheckboxPanel filterOption={filterOption as TCheckboxFilter} searchParams={new URLSearchParams(searchParams.toString())} />
                  </div>

                  <div className="flex items-center justify-between rounded-b-2xl bg-neutral-50 p-5 dark:border-t dark:border-neutral-800 dark:bg-neutral-900">
                    <CloseButton
                      className="-mx-3"
                      as={ButtonThird}
                      type="button"
                      onClick={() => handleClearFilter(filterOption.name)}
                    >
                      초기화
                    </CloseButton>
                    <CloseButton type="submit" as={ButtonPrimary}>
                      적용
                    </CloseButton>
                  </div>
                </div>
              </PopoverPanel>
            </Popover>
          )
        })}
      </PopoverGroup>

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
