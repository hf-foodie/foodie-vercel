'use client'

import { clientFetch } from '@/lib/clientFetch'
import { useRef, useState } from 'react'

type Restaurant = { restaurantId: number; name: string; address: string }
type Check = { exact: Restaurant[]; similar: Restaurant[]; similarTotal: number }
export type Registration = {
  restaurant: { name: string; address: string; phoneNumber: string; category: string; isLunch: boolean; isDinner: boolean; isSolo: boolean; isGroup4: boolean; isGroup8: boolean }
  reason: string
  reviewedCandidates: boolean
}
const options = [['isLunch', '점심'], ['isDinner', '저녁'], ['isSolo', '혼밥'], ['isGroup4', '4인 모임'], ['isGroup8', '8인 모임']] as const
export default function NewRestaurantForm({ name, address, busy, onSave, onExisting, onCancel }: {
  name: string; address: string; busy: boolean
  onSave: (value: Registration) => Promise<void>; onExisting: (value: Restaurant) => void; onCancel: () => void
}) {
  const [restaurant, setRestaurant] = useState({ name, address, phoneNumber: '', category: '', isLunch: false, isDinner: false, isSolo: false, isGroup4: false, isGroup8: false })
  const [reason, setReason] = useState('')
  const [check, setCheck] = useState<Check | null>(null)
  const [reviewed, setReviewed] = useState(false)
  const [checking, setChecking] = useState(false)
  const [error, setError] = useState('')
  const generation = useRef(0)
  const submitting = useRef(false)
  function identity(field: 'name' | 'address', value: string) {
    generation.current++; setChecking(false); setCheck(null); setReviewed(false); setError('')
    setRestaurant(previous => ({ ...previous, [field]: value }))
  }
  async function checkDuplicates() {
    const current = ++generation.current
    setChecking(true); setCheck(null); setReviewed(false); setError('')
    try {
      const response = await clientFetch('/curated-links/restaurant-duplicates?' + new URLSearchParams({name: restaurant.name, address: restaurant.address}))
      const body = await response.json()
      if (!response.ok) throw new Error(body.message || '중복 확인에 실패했습니다. 다시 시도해주세요.')
      if (current === generation.current) setCheck(body)
    } catch (e) { if (current === generation.current) setError(e instanceof Error ? e.message : '중복 확인에 실패했습니다.') }
    finally { if (current === generation.current) setChecking(false) }
  }
  async function submit(event: React.FormEvent) {
    event.preventDefault()
    if (busy || submitting.current || !check || check.exact.length || !reviewed) return
    submitting.current = true; setError('')
    try { await onSave({ restaurant, reason: reason.trim(), reviewedCandidates: reviewed }) }
    catch (e) { setError(e instanceof Error ? e.message : '등록에 실패했습니다. 다시 시도해주세요.'); setCheck(null); setReviewed(false) }
    finally { submitting.current = false }
  }
  return <form onSubmit={submit} aria-label="새 식당 등록 후 연결" className="space-y-4 rounded border p-4 sm:p-6">
    <h3 className="text-lg font-bold">새 식당 등록 후 연결</h3>
    <p>추천에 적힌 이름과 주소를 미리 입력했습니다. 실제 식당 정보와 지점을 확인해주세요. 등록하면 식당과 연결 이력이 함께 저장됩니다.</p>
    <fieldset disabled={busy} className="min-w-0 space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <label>새 식당명<input required maxLength={200} className="mt-1 block w-full rounded border p-3" value={restaurant.name} onChange={e => identity('name', e.target.value)} /></label>
        <label>새 식당 주소<input required maxLength={500} className="mt-1 block w-full rounded border p-3" value={restaurant.address} onChange={e => identity('address', e.target.value)} /></label>
        <label>전화번호 (선택)<input type="tel" maxLength={50} className="mt-1 block w-full rounded border p-3" value={restaurant.phoneNumber} onChange={e => setRestaurant({ ...restaurant, phoneNumber: e.target.value })} /></label>
        <label>음식 분류 (선택)<input maxLength={50} className="mt-1 block w-full rounded border p-3" value={restaurant.category} onChange={e => setRestaurant({ ...restaurant, category: e.target.value })} /></label>
      </div>
      <fieldset className="flex flex-wrap gap-4"><legend className="mb-2">이용 정보 (확인된 항목만 선택)</legend>{options.map(([key, label]) => <label key={key} className="flex min-h-11 items-center gap-2"><input type="checkbox" checked={restaurant[key]} onChange={e => setRestaurant({ ...restaurant, [key]: e.target.checked })} />{label}</label>)}</fieldset>
      <p className="text-sm">이름과 주소가 모두 같으면 공백·영문 대소문자가 달라도 중복으로 처리합니다. 이름 또는 주소가 같은 식당은 후보로 표시합니다.</p>
      <button type="button" className="kr-button" disabled={checking || !restaurant.name.trim() || !restaurant.address.trim()} onClick={checkDuplicates}>{checking ? '확인 중…' : '중복 확인'}</button>
      {check && <section aria-label="중복 확인 결과" className="space-y-3" aria-live="polite">
        <p className="font-bold">{check.exact.length ? '이미 등록된 식당입니다. 기존 식당을 선택해 연결해주세요.' : '이름과 주소가 모두 같은 등록 식당은 없습니다.'}</p>
        {check.similarTotal > 0 && <p>이름 또는 주소가 같은 후보 {check.similarTotal}곳{check.similarTotal > 20 && ' 중 20곳을 표시합니다. 등록 식당 검색에서 나머지 후보도 확인해주세요.'}</p>}
        {[...check.exact, ...check.similar].map(r => <div key={r.restaurantId} className="flex flex-wrap items-center justify-between gap-3 rounded border p-3"><div className="min-w-0 break-words"><p className="font-bold">{r.name} · {r.restaurantId}</p><p>{r.address}</p></div><button type="button" className="kr-button" onClick={() => onExisting(r)}>이 식당 선택</button></div>)}
        {!check.exact.length && <label className="flex items-start gap-3 rounded bg-neutral-50 p-3 dark:bg-neutral-800"><input className="mt-1" type="checkbox" checked={reviewed} onChange={e => setReviewed(e.target.checked)} /><span>기존 식당과 주소·지점을 비교했으며, 별도 식당으로 등록할 필요가 있음을 확인했습니다.</span></label>}
      </section>}
      <label className="block">등록 및 연결 사유<textarea required maxLength={500} rows={3} className="mt-1 block w-full rounded border p-3" value={reason} onChange={e => setReason(e.target.value)} placeholder="새 식당 등록과 추천 연결의 근거를 입력해주세요" /></label>
      {error && <p role="alert" className="break-words text-red-700">{error}</p>}
      <div className="flex flex-wrap gap-3"><button className="kr-button kr-button-primary" type="submit" disabled={!check || !!check.exact.length || !reviewed || !reason.trim()}>{busy ? '등록 및 연결 중…' : '식당 등록하고 연결'}</button><button className="kr-button" type="button" onClick={onCancel}>등록 취소</button></div>
    </fieldset>
  </form>
}
