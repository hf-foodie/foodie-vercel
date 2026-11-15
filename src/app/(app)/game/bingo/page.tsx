'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { restaurantListHref, restaurantReviewsHref } from '@/lib/restaurantNavigation'
import { saveBookmarkPosition, useBookmarkScroll } from '@/lib/bookmarkScroll'
import { useContext, useEffect, useMemo, useState } from 'react'
import { ThemeContext } from '@/app/theme-provider'
import { Breadcrumb, PageHeading } from '@/components/krds/PageHeading'
import RestaurantPhoto, { RestaurantPhotoCredit } from '@/components/krds/RestaurantPhoto'
import ConfirmDialog from '@/components/krds/ConfirmDialog'
import { BINGO_KEY, bingoLines, missions, missionRestaurants, newBingo, readBingo, readBingoView, restaurantRegion, toggleMission, type BingoState, type MissionId } from '@/lib/foodBingo'
import styles from './bingo.module.css'

export default function FoodBingo() {
  const restaurants = useContext(ThemeContext)?.restaurants ?? []
  const [board, setBoard] = useState<BingoState | null>(null)
  const params = useSearchParams()
  const view = readBingoView(params)
  const selected = view.mission
  const region = view.region ?? board?.region ?? ''
  const [notice, setNotice] = useState(''), [reset, setReset] = useState(false)
  useEffect(() => {
    function load() {
      try {
        const raw = localStorage.getItem(BINGO_KEY), saved = readBingo(raw)
        const next = saved ?? newBingo()
        setBoard(next)
        if (!saved) localStorage.setItem(BINGO_KEY, JSON.stringify(next))
        setNotice(raw && !saved ? '저장된 기록을 읽을 수 없어 새 판을 준비했습니다. 새 판을 저장했습니다.' : '')
      } catch { setBoard(newBingo()); setNotice('브라우저 저장을 사용할 수 없어 현재 화면에서만 진행할 수 있습니다.') }
    }
    load()
    const sync = (event: StorageEvent) => { if (event.key === BINGO_KEY || event.key === null) load() }
    window.addEventListener('storage', sync)
    return () => window.removeEventListener('storage', sync)
  }, [])
  function save(next: BingoState) {
    setBoard(next)
    try { localStorage.setItem(BINGO_KEY, JSON.stringify(next)); setNotice('이 브라우저에 저장했습니다.') }
    catch { setNotice('저장하지 못했습니다. 현재 화면에서는 이용할 수 있지만 새로고침하면 변경 내용이 사라질 수 있습니다.') }
  }
  const regions = useMemo(() => [...new Set(restaurants.map(r => restaurantRegion(r.address)).filter(Boolean))].sort((a,b) => a.localeCompare(b,'ko')), [restaurants])
  const rows = useMemo(() => missionRestaurants(restaurants, selected, region), [restaurants, selected, region])
  const page = Math.min(view.page, Math.max(0, Math.ceil(rows.length / 6) - 1))
  function href(mission: MissionId, index: number, area: string) {
    return restaurantListHref('/game/bingo', new URLSearchParams({ mission, page: String(index + 1), ...(area ? { region: area } : {}) }))
  }
  const listHref = href(selected, page, region)
  function updateView(mission: MissionId, index: number, area = region) {
    window.history.replaceState(null, '', href(mission, index, area))
  }
  useBookmarkScroll(listHref, !!board, 'bingo-restaurant-')
  const mission = missions.find(m => m.id === selected)!
  const lines = board ? bingoLines(board) : 0
  return <main className={`kr-container kr-main ${styles.main}`}>
    <Breadcrumb current="맛집빙고" parent={{label:'맛집게임',href:'/game'}} />
    <PageHeading title="맛집빙고" description="나만의 맛집 탐험 9칸! 미션을 골라 식당을 찾고, 다녀온 뒤 직접 완료를 체크해 보세요." />
    <p className="kr-form-note">로그인 없이 이용합니다. 기록은 현재 브라우저에만 저장되며 다른 기기·사내망·체험판 사이에 공유되지 않습니다. 브라우저 데이터를 삭제하면 기록도 사라집니다.</p>
    {!board ? <p role="status">빙고 기록을 불러오는 중입니다.</p> : <>
      <section className={`kr-panel ${styles.boardPanel}`} aria-label="나의 빙고판">
        <div className={styles.summary}><h2>나의 맛집 탐험</h2><p role="status">{board.checked.length} / 9칸 완료 · {lines}줄 빙고{board.checked.length === 9 ? ' · 🏆 맛집 탐험가 배지 획득!' : lines > 0 ? ' · 🎉 빙고 달성!' : ''}</p></div>
        <div className={styles.grid}>{board.order.map(id => { const m = missions.find(x => x.id === id)!; return <button type="button" key={id} className={`${styles.cell} ${board.checked.includes(id) ? styles.done : ''}`} aria-pressed={selected === id} aria-label={`${m.title}, ${board.checked.includes(id) ? '완료' : '미완료'}, 미션 보기`} onClick={() => updateView(id, 0)}><span aria-hidden="true">{m.icon}</span><strong>{m.title}</strong><small>{board.checked.includes(id) ? '✓ 완료' : '미션 보기'}</small></button> })}</div>
        <p className="kr-form-note">가로·세로·대각선 한 줄을 완성해 보세요. 방문 확인은 자기 확인 방식이며, 배지는 이 빙고판의 기념 표시입니다.</p>
        <button type="button" className="kr-button" onClick={() => setReset(true)}>{board.checked.length === 9 ? '새 빙고판 만들기' : '빙고판 초기화'}</button>
        <p role="status" className="kr-form-note">{notice}</p>
      </section>
      <section className={`kr-panel ${styles.detail}`} aria-label="선택한 미션">
        <h2>{mission.icon} {mission.title}</h2><p>{mission.description}</p>
        <button type="button" className="kr-button kr-button-primary" aria-pressed={board.checked.includes(selected)} onClick={() => save(toggleMission(board, selected))}>{board.checked.includes(selected) ? '완료 취소하기' : '미션 완료 체크'}</button>
        {selected === 'region' && <div className={styles.region}><label htmlFor="bingo-region">나의 기준 지역</label><select className="kr-input" id="bingo-region" value={region} onChange={e => { save({...board, region:e.target.value}); updateView(selected, 0, e.target.value) }}><option value="">기준 지역을 선택하세요</option>{regions.map(r => <option key={r}>{r}</option>)}</select></div>}
        <h3>찾아볼 등록 식당 · {rows.length}곳</h3>
        <p className="kr-form-note">등록된 메뉴·분류·혼밥 정보 기준입니다. 처음 방문·동료 추천·재방문·새 메뉴 여부는 직접 판단해 주세요. 후기가 없는 식당도 포함됩니다.</p>
        {!rows.length && <p>{selected === 'region' && !region ? '기준 지역을 선택하면 다른 시·도의 식당을 보여드립니다.' : '조건에 맞는 등록 식당이 없습니다. 다른 미션을 살펴보세요.'}</p>}
        <ul className={styles.results}>{rows.slice(page*6,page*6+6).map(r => <li id={'bingo-restaurant-' + r.restaurantId} data-restaurant-id={r.restaurantId} key={r.restaurantId}><div className={styles.photo}><RestaurantPhoto restaurantId={r.restaurantId} title={r.name} fallbackSrc={`/images/restaurant/thumbnail/${r.restaurantId}.jpg`} /></div><h4>{r.name}</h4><p>{r.address}</p><p>{r.representativeMenuNames.join(' · ') || '대표 메뉴 미등록'}</p><RestaurantPhotoCredit restaurantId={r.restaurantId} /><Link className="kr-button" href={restaurantReviewsHref(r.restaurantId, listHref)} onClick={event => {
          if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
          window.history.replaceState(null, '', listHref)
          const card = event.currentTarget.closest('li')
          if (card) saveBookmarkPosition(listHref, r.restaurantId, card)
        }}>{r.name} 후기 찾기</Link></li>)}</ul>
        {rows.length>6 && <nav className="kr-actions" aria-label="미션 식당 페이지"><button className="kr-button" disabled={page === 0} onClick={() => updateView(selected, page - 1)}>이전</button><span aria-live="polite">{page+1} / {Math.ceil(rows.length/6)}</span><button className="kr-button" disabled={(page+1)*6>=rows.length} onClick={() => updateView(selected, page + 1)}>다음</button></nav>}
      </section>
      <ConfirmDialog open={reset} title="새 빙고판을 만들까요?" description="현재 완료 체크와 기념 배지가 초기화되고, 9개 미션의 배치가 바뀝니다." confirmLabel="초기화하고 새로 시작" busy={false} onClose={() => setReset(false)} onConfirm={() => { const next = newBingo(); if(next.order.join() === board.order.join()) next.order.push(next.order.shift()!); save(next); updateView('first', 0, ''); setReset(false) }} />
    </>}
  </main>
}
