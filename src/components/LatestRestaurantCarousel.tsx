'use client'

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import Link from 'next/link'
import type { TRestaurant } from '@/data/types'
import RestaurantPhoto, { RestaurantPhotoCredit } from '@/components/krds/RestaurantPhoto'
import BookmarkBtn from '@/components/BookmarkBtn'
import BannerFullText from '@/components/BannerFullText'

export default function LatestRestaurantCarousel({ restaurants }: { restaurants: TRestaurant[] }) {
  const viewport = useRef<HTMLDivElement>(null)
  const [index, setIndex] = useState(0)
  const [visibleCount, setVisibleCount] = useState(1)
  const positionRef = useRef(0)
  const countRef = useRef(1)
  const pageCount = Math.ceil(restaurants.length / visibleCount)
  const pages = Array.from({ length: pageCount }, (_, page) => restaurants.slice(page * visibleCount, (page + 1) * visibleCount))
  useEffect(() => {
    const media = window.matchMedia('(min-width: 701px)')
    const resize = () => {
      const next = media.matches ? 3 : 1
      positionRef.current = Math.floor(positionRef.current * countRef.current / next)
      countRef.current = next
      setIndex(positionRef.current)
      setVisibleCount(next)
    }
    resize()
    media.addEventListener('change', resize)
    return () => media.removeEventListener('change', resize)
  }, [])
  useLayoutEffect(() => {
    const el = viewport.current
    if (el) el.scrollTo({ left: positionRef.current * el.clientWidth, behavior: 'instant' })
  }, [visibleCount])
  const [playing, setPlaying] = useState(false)
  const [hovered, setHovered] = useState(false)
  const updatePosition = useCallback(() => {
    const el = viewport.current
    if (el) {
      positionRef.current = Math.min(pageCount - 1, Math.max(0, Math.round(el.scrollLeft / el.clientWidth)))
      setIndex(positionRef.current)
    }
  }, [pageCount])
  const goTo = useCallback((target: number) => {
    const el = viewport.current
    if (!el) return
    el.scrollTo({ left: Math.max(0, Math.min(pageCount - 1, target)) * el.clientWidth, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' })
  }, [pageCount])
  useEffect(() => {
    const el = viewport.current
    if (!el) return
    const observer = new ResizeObserver(updatePosition)
    observer.observe(el)
    return () => observer.disconnect()
  }, [updatePosition])
  useEffect(() => {
    if (!playing || hovered || pageCount < 2) return
    const timer = window.setInterval(() => {
      if (!document.hidden) goTo((index + 1) % pageCount)
    }, 5000)
    return () => window.clearInterval(timer)
  }, [playing, hovered, index, pageCount, goTo])
  const move = (target: number) => { setPlaying(false); goTo(target) }
  if (!restaurants.length) return <p className="kr-empty">등록된 맛집이 없습니다.</p>
  return (
    <div className="kr-latest-banner" role="region" aria-label="새로 올라온 맛집" aria-roledescription="캐러셀"
      onPointerEnter={event => { if (event.pointerType === 'mouse') setHovered(true) }} onPointerLeave={() => setHovered(false)}>
      <div id="latest-restaurant-track" className="kr-latest-banner-track" ref={viewport} onScroll={updatePosition} tabIndex={0}
        aria-label="좌우 방향키 또는 스와이프로 맛집 넘기기" onFocusCapture={() => setPlaying(false)} onTouchStart={() => setPlaying(false)}
        onKeyDown={event => {
          if (event.target !== event.currentTarget) return
          if (['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) {
            event.preventDefault()
            move(event.key === 'Home' ? 0 : event.key === 'End' ? pageCount - 1 : index + (event.key === 'ArrowLeft' ? -1 : 1))
          }
        }}>
        {pages.map((page, pageIndex) => <div key={pageIndex} className="kr-latest-banner-page" style={{ gridTemplateColumns: `repeat(${visibleCount}, minmax(0, 1fr))` }} role="group" aria-roledescription="슬라이드" aria-label={`${pageIndex + 1} / ${pageCount}`} inert={pageIndex !== index}>
        {page.map(restaurant => <article key={restaurant.restaurantId} className="kr-latest-banner-slide">
          <span className="kr-latest-banner-subtitle">{restaurant.category || '맛집'} · 최신 등록순</span>
          <h3><BannerFullText label="식당명" text={restaurant.name} /></h3>
          <RestaurantPhoto restaurantId={restaurant.restaurantId} title={restaurant.name} fallbackSrc={'/images/restaurant/thumbnail/' + restaurant.restaurantId + '.jpg'} />
          <div className="kr-muted kr-latest-banner-address"><BannerFullText label="주소" text={restaurant.address} /></div>
          <div className="kr-latest-banner-menu"><BannerFullText label="대표 메뉴" lines={1} text={"대표 메뉴 · " + (restaurant.representativeMenuNames?.join(", ") || "등록된 메뉴가 없습니다.")} /></div>
          <div className="kr-latest-banner-credit"><RestaurantPhotoCredit restaurantId={restaurant.restaurantId} /></div>
          <div className="kr-latest-banner-actions"><Link className="kr-link" href={'/blogs?restaurantId=' + restaurant.restaurantId}>맛집 후기 찾기 →</Link><BookmarkBtn restaurantId={restaurant.restaurantId} /></div>
        </article>)}
        </div>)}
      </div>
      <div className="kr-latest-banner-controls" aria-label="배너 탐색">
        {pageCount > 1 && <>
          <button type="button" className="kr-latest-banner-control" aria-label={playing ? '슬라이드 멈춤' : '슬라이드 재생'} aria-pressed={playing} onClick={() => setPlaying(!playing)}>{playing ? 'Ⅱ' : '▷'}</button>
          <span className="kr-latest-banner-count" aria-live={playing ? 'off' : 'polite'}><strong>{index + 1}</strong><span aria-hidden="true"> / </span><span className="sr-only">전체 </span>{pageCount}</span>
          <button type="button" className="kr-latest-banner-control" aria-label="이전 맛집 보기" disabled={index === 0} onClick={() => move(index - 1)}>‹</button>
          <button type="button" className="kr-latest-banner-control" aria-label="다음 맛집 보기" disabled={index === pageCount - 1} onClick={() => move(index + 1)}>›</button>
        </>}
        <Link className="kr-latest-banner-control" href="/restaurant/hf" aria-label="전체 맛집 더 보기">＋</Link>
      </div>
    </div>
  )
}
