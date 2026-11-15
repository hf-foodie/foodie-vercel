'use client'

import { useEffect, useState } from 'react'
import { clientFetch } from '@/lib/clientFetch'

type MemberPage = {
  content: { memberId: string; name: string; count: number }[]
  number: number; size: number; totalElements: number; totalPages: number
}

export default function MemberSearchCounts({ days }: { days: number }) {
  const [draft, setDraft] = useState('')
  const [query, setQuery] = useState({ q: '', sort: 'countDesc', page: 0, size: 20 })
  const [retry, setRetry] = useState(0)
  const [result, setResult] = useState<{ key: string; data?: MemberPage; error?: string } | null>(null)
  const params = new URLSearchParams({ days: String(days), q: query.q, sort: query.sort, page: String(query.page), size: String(query.size) }).toString()
  const key = params + ':' + retry
  const loading = result?.key !== key
  const data = !loading ? result?.data : undefined
  const error = !loading ? result?.error : undefined

  useEffect(() => {
    const controller = new AbortController()
    void clientFetch('/admin/analytics/members?' + params, { signal: controller.signal })
      .then(async response => {
        if (!response.ok) throw new Error(response.status === 403 ? '관리자만 조회할 수 있습니다.' : response.status === 401 ? '로그인이 필요합니다.' : '회원별 검색 횟수를 불러오지 못했습니다.')
        return response.json() as Promise<MemberPage>
      })
      .then(value => { if (!controller.signal.aborted) setResult({ key, data: value }) })
      .catch((e: Error) => { if (!controller.signal.aborted) setResult({ key, error: e.message }) })
    return () => controller.abort()
  }, [params, key])

  const current = data?.number ?? query.page
  const pages = data?.totalPages ?? 0
  const start = Math.max(0, Math.min(current - 2, pages - 5))
  const go = (page: number) => setQuery(value => ({ ...value, page }))

  return <section className="kr-panel min-w-0" aria-labelledby="member-search-title">
    <h2 id="member-search-title" className="text-xl font-bold">회원별 검색 횟수</h2>
    <p className="kr-muted my-3">선택 기간 · 전체 등록 회원(비활성 포함) · 검색이 없으면 0건입니다. 개인별 검색 내용은 표시하지 않습니다.</p>
    <form className="space-y-3" onSubmit={event => { event.preventDefault(); setQuery(value => ({ ...value, q: draft.trim(), page: 0 })); setRetry(value => value + 1) }}>
      <label className="block" htmlFor="member-search-query">회원 검색</label>
      <div className="flex gap-2">
        <input id="member-search-query" className="min-w-0 flex-1 rounded border p-3" placeholder="닉네임 또는 회원 ID" value={draft} maxLength={100} onChange={event => setDraft(event.target.value)}/>
        <button className="kr-button shrink-0" type="submit">검색</button>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="min-w-0">회원 정렬
          <select className="mt-1 block w-full rounded border p-3" value={query.sort} onChange={event => setQuery(value => ({ ...value, sort: event.target.value, page: 0 }))}>
            <option value="countDesc">검색 횟수 많은 순</option><option value="countAsc">검색 횟수 적은 순</option><option value="nameAsc">닉네임 오름차순</option><option value="nameDesc">닉네임 내림차순</option>
          </select>
        </label>
        <label className="min-w-0">페이지당 회원 수
          <select className="mt-1 block w-full rounded border p-3" value={query.size} onChange={event => setQuery(value => ({ ...value, size: Number(event.target.value), page: 0 }))}>
            <option value={20}>20명</option><option value={50}>50명</option><option value={100}>100명</option>
          </select>
        </label>
      </div>
      <button className="kr-link" type="button" onClick={() => { setDraft(''); setQuery({ q: '', sort: 'countDesc', page: 0, size: 20 }); setRetry(value => value + 1) }}>조건 초기화</button>
    </form>
    <div className="mt-4" aria-live="polite" aria-busy={loading}>
      {loading && <p role="status">회원 통계를 불러오는 중입니다…</p>}
      {error && <div role="alert"><p>{error}</p><button className="kr-button mt-3" onClick={() => setRetry(value => value + 1)}>다시 시도</button></div>}
      {data && <>
        <p className="kr-muted mb-3">총 {data.totalElements.toLocaleString()}명{pages > 0 && ` · ${current + 1} / ${pages}페이지`}</p>
        {!data.content.length ? <p>검색 조건에 맞는 회원이 없습니다.</p> : <ol className="space-y-3" start={current * data.size + 1}>
          {data.content.map((member, index) => <li key={member.memberId} className="flex min-w-0 items-start justify-between gap-3 border-t pt-3">
            <div className="min-w-0 break-words"><span>{current * data.size + index + 1}. {member.name}</span><p className="kr-muted break-all text-sm">회원 ID: {member.memberId}</p></div>
            <strong className="shrink-0">{member.count.toLocaleString()}건</strong>
          </li>)}
        </ol>}
      </>}
    </div>
    {pages > 1 && <nav aria-label="회원 통계 페이지" className="mt-5 flex flex-wrap justify-center gap-2">
      <button className="kr-button" disabled={loading || current === 0} onClick={() => go(0)}>처음</button>
      <button className="kr-button" disabled={loading || current === 0} onClick={() => go(current - 1)}>이전</button>
      {Array.from({ length: Math.min(5, pages) }, (_, index) => start + index).map(page => <button className={'min-h-11 min-w-11 rounded border px-3 ' + (page === current ? 'bg-blue-800 font-bold text-white' : '')} key={page} aria-label={`회원 통계 ${page + 1}페이지`} aria-current={page === current ? 'page' : undefined} disabled={loading} onClick={() => go(page)}>{page + 1}</button>)}
      <button className="kr-button" disabled={loading || current >= pages - 1} onClick={() => go(current + 1)}>다음</button>
      <button className="kr-button" disabled={loading || current >= pages - 1} onClick={() => go(pages - 1)}>마지막</button>
    </nav>}
  </section>
}
