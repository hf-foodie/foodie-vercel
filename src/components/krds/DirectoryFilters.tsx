'use client'
import { TListFilterOptions } from '@/data/types'
import { usePathname, useSearchParams } from 'next/navigation'
import { recordSearch } from '@/lib/searchAnalytics'
export default function DirectoryFilters({
  options = [],
  placeholder = '식당명, 주소, 대표 메뉴 검색',
  offices = [],
}: {
  options?: TListFilterOptions
  placeholder?: string
  offices?: string[]
}) {
  const path = usePathname()
  const params = useSearchParams()
  return (
    <form key={params.toString()} action={path} onSubmit={e=>recordSearch(String(new FormData(e.currentTarget).get('q') || ''),path)} className="kr-recommend-search" role="search">
      <label htmlFor="directory-search">검색어</label>
      <div className="kr-search-form">
        <input
          id="directory-search"
          name="q"
          type="search"
          defaultValue={params.get('q') || ''}
          placeholder={placeholder}
        />
        <button className="kr-button kr-button-primary">검색</button>
      </div>
      {offices.length > 0 && <label className="mt-4 block">인근 부점
        <select name="office" defaultValue={params.get('office') || ''} className="ml-3 max-w-full rounded border p-3">
          <option value="">전체 부점</option>{offices.map(office => <option value={office} key={office}>{office}</option>)}
        </select>
      </label>}
      {options.length > 0 && (
        <div className="kr-recommend-filters">
          {options.map(
            (option) =>
              option.tabUIType === 'checkbox' && (
                <fieldset key={option.name}>
                  <legend>{option.label}</legend>
                  {option.options.map((item) => (
                    <label key={item.value}>
                      <input
                        name={option.name + '[]'}
                        type="checkbox"
                        value={item.value}
                        defaultChecked={
                          params.has(option.name + '[]')
                            ? params.getAll(option.name + '[]').includes(item.value)
                            : !!item.defaultChecked
                        }
                      />
                      {item.name}
                    </label>
                  ))}
                </fieldset>
              )
          )}
          <button className="kr-button">조건 적용</button>
          <a className="kr-link" href={path}>
            초기화
          </a>
          <p className="kr-form-note w-full">선택한 조건 안에서 검색합니다. 선택하지 않은 분류는 전체로 조회합니다.</p>
        </div>
      )}
    </form>
  )
}
