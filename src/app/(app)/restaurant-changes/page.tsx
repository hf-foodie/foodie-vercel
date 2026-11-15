'use client'
import AdminNavigation from '@/components/krds/AdminNavigation'
import ConfirmDialog from '@/components/krds/ConfirmDialog'
import { Breadcrumb, PageHeading, StatusMessage } from '@/components/krds/PageHeading'
import { clientFetch } from '@/lib/clientFetch'
import { useEffect, useRef, useState } from 'react'

type Values = {
  name: string
  address: string
  phoneNumber: string
  category: string
  isLunch: boolean
  isDinner: boolean
  isSolo: boolean
  isGroup4: boolean
  isGroup8: boolean
}
type Restaurant = Values & { restaurantId: number }
type Proposal = {
  id: number
  restaurantId: number
  requesterId: string
  status: string
  original: Values
  proposed: Values
  reviewerId: string | null
  createdAt: string
  reviewedAt: string | null
}
const labels: Record<keyof Values, string> = {
  name: '식당명',
  address: '주소',
  phoneNumber: '전화번호',
  category: '음식 분류',
  isLunch: '점심',
  isDinner: '저녁',
  isSolo: '혼밥',
  isGroup4: '4인 단체',
  isGroup8: '8인 단체',
}
const textFields = ['name', 'address', 'phoneNumber', 'category'] as const
const flags = ['isLunch', 'isDinner', 'isSolo', 'isGroup4', 'isGroup8'] as const
const statusLabels: Record<string, string> = { PENDING: '대기', APPROVED: '승인', REJECTED: '반려' }
const api = process.env.NEXT_PUBLIC_API_URL || ''
function display(value: string | boolean | null) {
  return typeof value === 'boolean' ? (value ? '가능' : '불가') : value || '미입력'
}
function date(value: string) {
  return new Date(value).toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' })
}
async function request(path: string, options?: RequestInit) {
  const response = await clientFetch(api + path, options)
  if (!response.ok) {
    const body = await response.json().catch(() => null)
    throw new Error(body?.message || '요청을 처리하지 못했습니다.')
  }
  return response
}
export default function RestaurantChangesPage() {
  const [confirmation, setConfirmation] = useState<{ id: number; approve: boolean } | null>(null)
  const [restaurants, setRestaurants] = useState<Restaurant[]>([])
  const [selected, setSelected] = useState<number>(0)
  const [values, setValues] = useState<Values | null>(null)
  const [moderator, setModerator] = useState(false)
  const [proposals, setProposals] = useState<Proposal[]>([])
  const [page, setPage] = useState(0)
  const [pages, setPages] = useState(0)
  const [busy, setBusy] = useState(false)
  const [ready, setReady] = useState(false)
  const [message, setMessage] = useState('')
  const [status, setStatus] = useState('PENDING')
  const [listError, setListError] = useState('')
  const [revision, setRevision] = useState(0)
  const inFlight = useRef(false)
  const listQuery = '/restaurant-change-requests?page=' + page + (status ? '&status=' + status : '')
  const [loadedQuery, setLoadedQuery] = useState('')
  const loadingList = loadedQuery !== listQuery
  async function load(p: number) {
    const query = '/restaurant-change-requests?page=' + p + (status ? '&status=' + status : '')
    const data = await (await request(query)).json()
    setProposals(data.content)
    setPages(data.totalPages)
    setLoadedQuery(query)
    setListError('')
  }
  useEffect(() => {
    let active = true
    Promise.all([request('/me').then((r) => r.json()), request('/restaurants').then((r) => r.json())])
      .then(([me, list]) => {
        if (active) {
          setModerator(['MANAGER', 'ADMIN'].includes(me.role))
          setRestaurants(list)
          setReady(true)
        }
      })
      .catch((e) => {
        if (active) setMessage(e.message)
      })
    return () => {
      active = false
    }
  }, [])
  useEffect(() => {
    if (!ready) return
    let active = true
    request(listQuery)
      .then((r) => r.json())
      .then((data) => {
        if (active) {
          setProposals(data.content)
          setPages(data.totalPages)
          setListError('')
          setLoadedQuery(listQuery)
        }
      })
      .catch((e) => {
        if (active) {
          setListError(e.message)
          setLoadedQuery(listQuery)
        }
      })
    return () => {
      active = false
    }
  }, [listQuery, ready, revision])
  function choose(id: number) {
    setSelected(id)
    const r = restaurants.find((r) => r.restaurantId === id)
    setValues(
      r
        ? {
            name: r.name,
            address: r.address,
            phoneNumber: r.phoneNumber || '',
            category: r.category || '',
            isLunch: !!r.isLunch,
            isDinner: !!r.isDinner,
            isSolo: !!r.isSolo,
            isGroup4: !!r.isGroup4,
            isGroup8: !!r.isGroup8,
          }
        : null
    )
  }
  async function save() {
    if (!values || !selected || inFlight.current) return
    inFlight.current = true
    let saved = false
    setBusy(true)
    setMessage('')
    try {
      await request(moderator ? '/restaurants/' + selected : '/restaurants/' + selected + '/change-requests', {
        method: moderator ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      })
      saved = true
      setMessage(moderator ? '식당 정보를 수정했습니다.' : '수정 제안을 제출했습니다. 승인 후 반영됩니다.')
      setRestaurants(await (await request('/restaurants')).json())
      await load(page)
    } catch (e) {
      setMessage(
        saved
          ? '저장은 완료됐지만 목록을 갱신하지 못했습니다. 새로고침해 주세요.'
          : e instanceof Error
            ? e.message
            : '처리 실패'
      )
    } finally {
      setBusy(false)
      inFlight.current = false
    }
  }
  async function review(id: number, approve: boolean) {
    if (inFlight.current) return
    inFlight.current = true
    let saved = false
    setBusy(true)
    setMessage('')
    try {
      await request('/restaurant-change-requests/' + id + '/decisions', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({status: approve ? 'APPROVED' : 'REJECTED'}) })
      saved = true
      await load(page)
      setRestaurants(await (await request('/restaurants')).json())
      setValues(null)
      setSelected(0)
      setConfirmation(null)
      setMessage(approve ? '승인했습니다.' : '반려했습니다.')
    } catch (e) {
      setMessage(
        saved
          ? '처리는 완료됐지만 목록을 갱신하지 못했습니다. 새로고침해 주세요.'
          : e instanceof Error
            ? e.message
            : '처리 실패'
      )
    } finally {
      setConfirmation(null)
      setBusy(false)
      inFlight.current = false
    }
  }
  return (
    <main className="kr-container kr-main kr-admin space-y-6">
      <Breadcrumb current="식당 정보 수정·제안" />
      <PageHeading title="식당 정보 수정·제안" />
      <AdminNavigation />
      <p>
        {moderator
          ? '매니저·관리자는 직접 수정하거나 회원의 제안을 검토할 수 있습니다.'
          : '수정 제안은 매니저·관리자의 승인 후 반영됩니다.'}
      </p>
      <StatusMessage>{message}</StatusMessage>
      {ready && (
        <details className="kr-admin-details" open={!moderator}>
          <summary>{moderator ? '식당 정보 직접 수정' : '식당 정보 수정 제안 작성'}</summary>
          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault()
              void save()
            }}
          >
            <label className="block">
              식당 선택
              <select
                className="block w-full rounded border p-2"
                value={selected}
                onChange={(e) => choose(Number(e.target.value))}
                disabled={busy}
              >
                <option value={0}>식당을 선택하세요</option>
                {restaurants.map((r) => (
                  <option key={r.restaurantId} value={r.restaurantId}>
                    {r.name} — {r.address}
                  </option>
                ))}
              </select>
            </label>
            {values && (
              <fieldset disabled={busy} className="space-y-3">
                {textFields.map((k) => (
                  <label key={k} className="block">
                    {labels[k]}
                    <input
                      className="block w-full rounded border p-2"
                      required={k === 'name' || k === 'address'}
                      maxLength={k === 'name' ? 200 : k === 'address' ? 500 : 50}
                      value={values[k]}
                      onChange={(e) => setValues({ ...values, [k]: e.target.value })}
                    />
                  </label>
                ))}
                <div className="flex flex-wrap gap-4">
                  {flags.map((k) => (
                    <label key={k}>
                      <input
                        type="checkbox"
                        checked={values[k]}
                        onChange={(e) => setValues({ ...values, [k]: e.target.checked })}
                      />{' '}
                      {labels[k]}
                    </label>
                  ))}
                </div>
                <button className="rounded bg-neutral-900 px-4 py-2 text-white" type="submit">
                  {moderator ? '즉시 수정' : '수정 제안 제출'}
                </button>
              </fieldset>
            )}
          </form>
        </details>
      )}
      {ready && (
        <section className="space-y-4">
          <h2 className="text-xl font-semibold">{moderator ? '수정 제안 검토' : '내 수정 제안'}</h2>
          <label>
            처리 상태{' '}
            <select
              value={status}
              disabled={busy}
              onChange={(e) => {
                setStatus(e.target.value)
                setPage(0)
              }}
              className="rounded border p-2"
            >
              <option value="PENDING">대기</option>
              <option value="APPROVED">승인</option>
              <option value="REJECTED">반려</option>
              <option value="">전체</option>
            </select>
          </label>
          <button type="button" disabled={busy} onClick={() => setRevision((r) => r + 1)} className="ml-4 underline">
            목록 새로고침
          </button>
          {loadingList && <p role="status">제안을 불러오고 있습니다.</p>}
          {listError && <p role="alert">{listError}</p>}
          {!loadingList && !listError && proposals.length === 0 && <p>이 상태의 수정 제안이 없습니다.</p>}
          {!loadingList &&
            !listError &&
            proposals.map((p) => (
              <article key={p.id} className="kr-proposal space-y-3">
                <h3 className="font-semibold">
                  {p.original.name}{' '}
                  <span className={'kr-badge kr-status-' + p.status}>{statusLabels[p.status] || p.status}</span>
                </h3>
                <p className="text-sm">
                  제안자 {p.requesterId} · {date(p.createdAt)}
                </p>
                {p.reviewedAt && (
                  <p className="text-sm">
                    처리자 {p.reviewerId} · {date(p.reviewedAt)}
                  </p>
                )}
                <div className="kr-compare">
                  {(['original', 'proposed'] as const).map((side) => (
                    <div key={side}>
                      <h4>{side === 'original' ? '제안 당시 정보' : '수정 제안'}</h4>
                      <dl>
                        {(Object.keys(labels) as (keyof Values)[])
                          .filter((k) => p.original[k] !== p.proposed[k])
                          .map((k) => (
                            <div key={k}>
                              <dt>{labels[k]}</dt>
                              <dd>{display(p[side][k])}</dd>
                            </div>
                          ))}
                      </dl>
                    </div>
                  ))}
                </div>
                {moderator && p.status === 'PENDING' && (
                  <div className="kr-review-actions">
                    <button
                      disabled={busy}
                      className="kr-button-primary"
                      onClick={() => setConfirmation({ id: p.id, approve: true })}
                    >
                      승인
                    </button>
                    <button disabled={busy} onClick={() => setConfirmation({ id: p.id, approve: false })}>
                      반려
                    </button>
                  </div>
                )}
              </article>
            ))}
          <div className="flex gap-4">
            <button disabled={busy || page === 0} onClick={() => setPage(page - 1)}>
              이전
            </button>
            <span>
              {page + 1} / {Math.max(pages, 1)}
            </span>
            <button
              disabled={busy || loadingList || !!listError || page + 1 >= pages}
              onClick={() => setPage(page + 1)}
            >
              다음
            </button>
          </div>
        </section>
      )}
      <ConfirmDialog
        open={!!confirmation}
        title={confirmation?.approve ? '수정 제안을 승인할까요?' : '수정 제안을 반려할까요?'}
        description={
          confirmation?.approve
            ? '승인하면 수정 제안이 식당 정보에 즉시 반영됩니다.'
            : '반려하면 이 제안은 반영되지 않고 처리 이력에 남습니다.'
        }
        confirmLabel={confirmation?.approve ? '승인하고 반영' : '반려'}
        busy={busy}
        onClose={() => setConfirmation(null)}
        onConfirm={() => {
          if (confirmation) void review(confirmation.id, confirmation.approve)
        }}
      />
    </main>
  )
}
