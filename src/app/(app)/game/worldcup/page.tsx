'use client'

import Link from 'next/link'
import { useContext, useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { restaurantReviewsHref } from '@/lib/restaurantNavigation'
import { saveBookmarkPosition, useBookmarkScroll } from '@/lib/bookmarkScroll'
import { ThemeContext } from '@/app/theme-provider'
import { Breadcrumb, PageHeading } from '@/components/krds/PageHeading'
import { chooseMenu, matchKey, menuCandidates, readWorldcupView, worldcupHref, startCup, type Cup } from '@/lib/lunchWorldcup'
import styles from './worldcup.module.css'

export default function LunchWorldcup() {
  const restaurants = useContext(ThemeContext)?.restaurants
  const params = useSearchParams()
  const { office, size, winner, page: requestedPage } = readWorldcupView(params)
  const [cup, setCup] = useState<Cup | null>(null)
  const offices = useMemo(() => [...new Set((restaurants ?? []).flatMap(r => r.nearOfficeNames))].sort((a,b) => a === '본사' ? -1 : b === '본사' ? 1 : a.localeCompare(b, 'ko')), [restaurants])
  const candidates = useMemo(() => menuCandidates(restaurants ?? [], office), [restaurants, office])
  const champion = candidates.find(menu => menu.id === (winner ?? cup?.champion?.id))
  const pair = cup?.round.slice(cup.winners.length * 2, cup.winners.length * 2 + 2) ?? []
  const resultRows = champion?.restaurants ?? []
  const page = Math.min(requestedPage, Math.max(0, Math.ceil(resultRows.length / 6) - 1))
  const listHref = worldcupHref(champion?.id ?? null, office, size, page)
  useEffect(() => {
    // A restored result URL takes precedence over any cached tournament state.
    if (cup?.champion && !winner) window.history.replaceState(null, '', worldcupHref(cup.champion.id, office, size))
  }, [cup?.champion, office, size, winner])
  useBookmarkScroll(listHref, !!champion, 'worldcup-restaurant-')
  function reset() {
    setCup(null)
    window.history.replaceState(null, '', worldcupHref(null, office, size))
  }
  return <main className={`kr-container kr-main ${styles.main}`}>
    <Breadcrumb current="맛집월드컵" parent={{label:'맛집게임',href:'/game'}} />
    <PageHeading title="맛집월드컵" description="지금 더 먹고 싶은 메뉴를 골라보세요. 우승 메뉴를 파는 등록 식당까지 찾아드려요." />
    <p className="kr-form-note">로그인 없이 즐길 수 있어요. 우승 결과는 현재 주소에 유지되며 후기에서 돌아와도 이어서 볼 수 있어요. 식당의 실제 판매 여부는 방문 전 확인해 주세요.</p>
    {(!cup || cup.champion) && !champion ? <section className={`kr-panel ${styles.setup}`} aria-label="월드컵 설정">
      <div className={styles.hero} aria-hidden="true">🍜 🏆 🍛</div>
      <h2>오늘 점심의 우승 메뉴는?</h2>
      <p>등록된 대표 메뉴가 있는 식당만 연결합니다. 메뉴 그림은 음식 종류를 나타내는 아이콘입니다.</p>
      {params.has('winner') && <p role="status">우승 메뉴 정보를 찾지 못했습니다. 설정을 확인하고 다시 시작해 주세요.</p>}
      <label htmlFor="cup-office">근무지 주변 식당</label>
      <select id="cup-office" className="kr-input" value={office} onChange={e=>window.history.replaceState(null, '', worldcupHref(null, e.target.value, size))}><option value="">모든 지역</option>{offices.map(o=><option key={o}>{o}</option>)}</select>
      <fieldset><legend>대결 규모</legend><div className="kr-actions">{[8,16].map(n=><label className={styles.size} key={n}><input type="radio" name="cup-size" value={n} checked={size===n} onChange={()=>window.history.replaceState(null, '', worldcupHref(null, office, n))} /> {n}강 <small>· {n-1}번 선택</small></label>)}</div></fieldset>
      <p role="status">선택 가능한 메뉴 {candidates.length}가지{candidates.length < size ? ' · 근무지를 넓히거나 대결 규모를 줄여 주세요.' : ''}</p>
      {!restaurants?.length && <p>등록된 식당 정보를 불러오지 못했거나 식당이 없습니다. 잠시 후 새로고침해 주세요.</p>}
      <button className="kr-button kr-button-primary" disabled={candidates.length<size} onClick={()=>{window.history.replaceState(null, '', worldcupHref(null, office, size));setCup(startCup(candidates,size))}}>{size}강 시작하기</button>
    </section> : champion ? <section className="kr-panel" aria-label="월드컵 결과">
      <div className={styles.result}><span className={styles.hero} aria-hidden="true">🏆 {champion.icon}</span><h2 tabIndex={-1}>오늘 점심은 {champion.name}!</h2><p>{office || '모든 지역'}에서 대표 메뉴로 등록한 식당 {resultRows.length}곳</p></div>
      <p className="kr-form-note">등록 정보와 연결된 후기만 표시합니다. 아직 후기가 없는 식당은 후기 목록이 비어 있을 수 있어요.</p>
      <ul className={styles.results}>{resultRows.slice(page*6,page*6+6).map(r=><li id={'worldcup-restaurant-' + r.restaurantId} data-restaurant-id={r.restaurantId} key={r.restaurantId}><h3>{r.name}</h3><p>{r.address}</p><p className={styles.menus}>{r.representativeMenuNames.join(' · ')}</p><Link className="kr-button kr-button-primary" href={restaurantReviewsHref(r.restaurantId, listHref)} onClick={event => {
        if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
        window.history.replaceState(null, '', listHref)
        const card = event.currentTarget.closest('li')
        if (card) saveBookmarkPosition(listHref, r.restaurantId, card)
      }}>{r.name} 후기 찾기</Link></li>)}</ul>
      {resultRows.length>6 && <nav className="kr-actions" aria-label="우승 메뉴 식당 페이지"><button className="kr-button" disabled={page===0} onClick={()=>window.history.replaceState(null, '', worldcupHref(champion.id, office, size, page - 1))}>이전</button><span aria-live="polite">{page+1} / {Math.ceil(resultRows.length/6)}</span><button className="kr-button" disabled={(page+1)*6>=resultRows.length} onClick={()=>window.history.replaceState(null, '', worldcupHref(champion.id, office, size, page + 1))}>다음</button></nav>}
      <div className={`kr-actions ${styles.actions}`}><button className="kr-button" onClick={reset}>다시 도전하기</button><Link href="/game/roulette" className="kr-button">오늘의메뉴</Link></div>
    </section> : cup ? <section className="kr-panel" aria-label="메뉴 대결">
      <div className={styles.round} aria-live="polite"><h2>{cup.round.length===2?'결승':`${cup.round.length}강`} · {cup.winners.length+1} / {cup.round.length/2}</h2><p>{cup.completed} / {cup.size-1}번 선택 완료</p></div>
      <progress className={styles.progress} aria-label="월드컵 진행률" value={cup.completed} max={cup.size-1}/>
      <div className={styles.match}>{pair.map(menu=><button key={`${matchKey(cup)}:${menu.id}`} className={styles.card} onClick={()=>{const key=matchKey(cup);setCup(current=>current?chooseMenu(current,menu.id,key):null)}} aria-label={`${menu.name} 선택`}><span className={styles.icon} aria-hidden="true">{menu.icon}</span><strong>{menu.name}</strong><span>등록 식당 {menu.restaurants.length}곳</span><span className={styles.pick}>이 메뉴 선택 →</span></button>)}</div>
      <p className={styles.tip}>왼쪽과 오른쪽 중 지금 더 먹고 싶은 메뉴 하나를 선택하세요.</p>
      <button className="kr-button" onClick={reset}>처음으로 돌아가기</button>
    </section> : null}
  </main>
}
