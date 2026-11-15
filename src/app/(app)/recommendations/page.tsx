'use client'
import AdminNavigation from '@/components/krds/AdminNavigation'
import { Breadcrumb, PageHeading, StatusMessage } from '@/components/krds/PageHeading'
import { clientFetch } from '@/lib/clientFetch'
import {
  Recommendation,
  RecommendationContent,
  RecommendationHistory,
  recommendationImages,
} from '@/lib/recommendation'
import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'

const empty: RecommendationContent = {
  title: '',
  description: '',
  featuredImage: recommendationImages[0],
  address: '',
  reviewStart: 5,
  representative_menu: '',
  branch: [],
  timeZoneCategory: ['점심'],
  foodStyleCategory: [],
  displayOrder: 21,
}
const labels = { title: '식당명', description: '소개', address: '주소', representative_menu: '대표 메뉴' } as const
const arrayLabels = { branch: '추천 지사', timeZoneCategory: '식사 시간', foodStyleCategory: '음식 분류' } as const
async function request(path: string, options?: RequestInit) {
  const response = await clientFetch(path, options)
  if (!response.ok) {
    const data = await response.json().catch(() => null)
    throw new Error(data?.message || '요청을 처리하지 못했습니다.')
  }
  return response.json()
}
export default function RecommendationsPage() {
  const [items, setItems] = useState<Recommendation[]>([])
  const [selected, setSelected] = useState<Recommendation | null>(null)
  const [content, setContent] = useState<RecommendationContent>(empty)
  const [allowed, setAllowed] = useState(false)
  const [ready, setReady] = useState(false)
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  const [history, setHistory] = useState<RecommendationHistory[]>([])
  const [historyPage, setHistoryPage] = useState(0)
  const inFlight = useRef(false)
  const historyRequest = useRef(0)
  useEffect(() => {
    let active = true
    Promise.all([request('/me'), request('/recommendations/intern')])
      .then(([me, list]) => {
        if (!active) return
        setAllowed(['MANAGER', 'ADMIN'].includes(me.role))
        setItems(list)
        if (list[0]) {
          setSelected(list[0])
          setContent(list[0].content)
        }
      })
      .catch((error) => {
        if (active) setMessage(error.message)
      })
      .finally(() => {
        if (active) setReady(true)
      })
    return () => {
      active = false
    }
  }, [])
  async function loadHistory(item: Recommendation, page: number) {
    const sequence = ++historyRequest.current
    try {
      const list = await request(`/recommendations/intern/${item.id}/history?page=${page}`)
      if (sequence === historyRequest.current) {
        setHistory(list)
        setHistoryPage(page)
      }
    } catch (error) {
      if (sequence === historyRequest.current)
        setMessage(error instanceof Error ? error.message : '이력을 불러오지 못했습니다.')
    }
  }
  function select(item: Recommendation | null) {
    historyRequest.current++
    setHistory([])
    setHistoryPage(0)
    setSelected(item)
    setContent(item ? item.content : { ...empty, displayOrder: items.length + 1 })
    setMessage('')
  }
  async function save(event: React.FormEvent) {
    event.preventDefault()
    if (inFlight.current) return
    inFlight.current = true
    setBusy(true)
    setMessage('')
    try {
      const saved: Recommendation = await request('/recommendations/intern' + (selected ? `/${selected.id}` : ''), {
        method: selected ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(selected ? { revision: selected.revision, content } : content),
      })
      historyRequest.current++
      setSelected(saved)
      setContent(saved.content)
      setHistory([])
      setItems((previous) =>
        [...previous.filter((item) => item.id !== saved.id), saved].sort(
          (a, b) => a.content.displayOrder - b.content.displayOrder || a.id.localeCompare(b.id)
        )
      )
      setMessage('저장했습니다. 추천 페이지에 바로 반영됩니다.')
    } catch (error) {
      setMessage(error instanceof Error ? error.message : '저장하지 못했습니다.')
    } finally {
      inFlight.current = false
      setBusy(false)
    }
  }
  if (!ready) return <main className="kr-container kr-main kr-admin">불러오는 중입니다…</main>
  if (!allowed)
    return (
      <main className="kr-container kr-main kr-admin">
        <h1 className="text-2xl font-bold">추천 콘텐츠 관리</h1>
        <p className="mt-4">매니저와 관리자만 편집할 수 있습니다.</p>
        <p role="alert">{message}</p>
        <a href="/login" className="underline">
          로그인
        </a>
      </main>
    )
  return (
    <main className="kr-container kr-main kr-admin">
      <Breadcrumb current="추천 콘텐츠 관리" />
      <PageHeading title="추천 콘텐츠 관리" />
      <AdminNavigation />
      <p className="my-3">저장하면 바로 게시되며 이전 내용과 수정자가 변경 이력에 남습니다.</p>
      <StatusMessage>{message}</StatusMessage>
      <div className="kr-actions">
        <label>
          편집할 추천{' '}
          <select
            disabled={busy}
            value={selected?.id || ''}
            onChange={(e) => select(items.find((item) => item.id === e.target.value) || null)}
            className="rounded border p-2"
          >
            <option value="">새 추천</option>
            {items.map((item) => (
              <option key={item.id} value={item.id}>
                {item.content.title}
              </option>
            ))}
          </select>
        </label>
        <button disabled={busy} className="rounded border p-2" onClick={() => select(null)}>
          새 추천 작성
        </button>
        <button disabled={busy} className="rounded border p-2" onClick={() => window.location.reload()}>
          최신 내용 불러오기
        </button>
        <a className="p-2 underline" href="/influencer/intern">
          추천 페이지 보기
        </a>
      </div>
      <form onSubmit={save} className="kr-panel mt-6 space-y-4">
        <fieldset disabled={busy} className="space-y-4">
          {Object.entries(labels).map(([key, label]) => (
            <label key={key} className="block">
              {label}
              <input
                className="mt-1 block w-full rounded border p-2"
                required={key !== 'description'}
                maxLength={key === 'title' ? 200 : key === 'description' ? 2000 : 500}
                value={content[key as keyof typeof labels]}
                onChange={(e) => setContent({ ...content, [key]: e.target.value })}
              />
            </label>
          ))}
          {Object.entries(arrayLabels).map(([key, label]) => (
            <label key={key} className="block">
              {label} <span className="text-sm">(쉼표로 구분{key === 'timeZoneCategory' ? ', 점심·저녁' : ''})</span>
              <input
                required
                className="mt-1 block w-full rounded border p-2"
                value={content[key as keyof typeof arrayLabels].join(',')}
                onChange={(e) => setContent({ ...content, [key]: e.target.value.split(',') })}
                onBlur={() =>
                  setContent({
                    ...content,
                    [key]: [...new Set(content[key as keyof typeof arrayLabels].map((v) => v.trim()).filter(Boolean))],
                  })
                }
              />
            </label>
          ))}
          <label className="block">
            추천 점수{' '}
            <input
              className="rounded border p-2"
              type="number"
              min="0"
              max="5"
              step="0.5"
              required
              value={content.reviewStart}
              onChange={(e) => setContent({ ...content, reviewStart: Number(e.target.value) })}
            />
          </label>
          <label className="block">
            표시 순서{' '}
            <input
              className="rounded border p-2"
              type="number"
              min="0"
              max="100000"
              required
              value={content.displayOrder}
              onChange={(e) => setContent({ ...content, displayOrder: Number(e.target.value) })}
            />
          </label>
          <label className="block">
            사진{' '}
            <select
              className="rounded border p-2"
              value={content.featuredImage}
              onChange={(e) => setContent({ ...content, featuredImage: e.target.value })}
            >
              {recommendationImages.map((image, i) => (
                <option key={image} value={image}>
                  기존 사진 {i + 1}
                </option>
              ))}
            </select>
          </label>
          <Image
            src={content.featuredImage}
            alt="선택한 추천 사진"
            width={280}
            height={180}
            className="h-44 w-72 object-contain"
          />
          <button className="rounded bg-neutral-900 px-5 py-3 text-white" type="submit">
            {busy ? '저장 중…' : '저장하고 게시'}
          </button>
        </fieldset>
      </form>
      {selected && (
        <section className="mt-10">
          <h2 className="text-xl font-semibold">변경 이력</h2>
          <button disabled={busy} className="my-3 rounded border p-2" onClick={() => loadHistory(selected, 0)}>
            이력 불러오기
          </button>
          {history.map((entry) => (
            <details key={entry.revision} className="border-b py-3">
              <summary>
                {entry.revision === 0 ? '최초 등록' : `${entry.revision}번째 수정`} · {entry.actor} ·{' '}
                {new Date(entry.changedAt).toLocaleString('ko-KR')}
              </summary>
              <dl className="space-y-2 py-3">
                {Object.entries(labels).map(([key, label]) => (
                  <div key={key}>
                    <dt className="font-semibold">{label}</dt>
                    <dd>{entry.content[key as keyof typeof labels]}</dd>
                  </div>
                ))}
                {Object.entries(arrayLabels).map(([key, label]) => (
                  <div key={key}>
                    <dt className="font-semibold">{label}</dt>
                    <dd>{entry.content[key as keyof typeof arrayLabels].join(', ')}</dd>
                  </div>
                ))}
                <div>
                  점수 {entry.content.reviewStart} · 순서 {entry.content.displayOrder}
                </div>
                <Image
                  src={entry.content.featuredImage}
                  alt="이전 사진"
                  width={200}
                  height={140}
                  className="object-contain"
                />
              </dl>
            </details>
          ))}
          <div className="mt-3 flex gap-3">
            <button disabled={historyPage === 0} onClick={() => loadHistory(selected, historyPage - 1)}>
              이전 이력
            </button>
            <button disabled={history.length < 20} onClick={() => loadHistory(selected, historyPage + 1)}>
              다음 이력
            </button>
          </div>
        </section>
      )}
    </main>
  )
}
