'use client'
import { usePathname, useSearchParams } from 'next/navigation'
import { recordSearch } from '@/lib/searchAnalytics'
export default function RecommendationSearch({ intern = false }: { intern?: boolean }) {
  const params = useSearchParams()
  const path = usePathname()
  return (
    <form action={path} onSubmit={e=>recordSearch(String(new FormData(e.currentTarget).get('q') || ''),path)} className="kr-recommend-search" role="search">
      <label htmlFor="listing-search">추천 맛집 검색</label>
      <div className="kr-search-form">
        <input
          key={params.get('q')}
          id="listing-search"
          name="q"
          type="search"
          defaultValue={params.get('q') || ''}
          placeholder="식당명, 주소, 대표 메뉴 검색"
        />
        <button className="kr-button kr-button-primary">검색</button>
      </div>
      {intern && (
        <div className="kr-recommend-filters">
          <fieldset>
            <legend>식사 시간</legend>
            {[
              ['lunch', '점심'],
              ['dinner', '저녁'],
            ].map(([v, label]) => (
              <label key={v}>
                <input
                  type="checkbox"
                  name="time-zone[]"
                  value={v}
                  defaultChecked={params.getAll('time-zone[]').includes(v)}
                />
                {label}
              </label>
            ))}
          </fieldset>
          <fieldset>
            <legend>음식 분류</legend>
            {[
              ['korean-food', '한식'],
              ['chinese-food', '중식'],
              ['japanese-food', '일식'],
              ['western-food', '양식'],
            ].map(([v, label]) => (
              <label key={v}>
                <input
                  type="checkbox"
                  name="food-style[]"
                  value={v}
                  defaultChecked={params.getAll('food-style[]').includes(v)}
                />
                {label}
              </label>
            ))}
          </fieldset>
          <button className="kr-button">조건 적용</button>
          <a className="kr-link" href={path}>
            초기화
          </a>
        </div>
      )}
    </form>
  )
}
