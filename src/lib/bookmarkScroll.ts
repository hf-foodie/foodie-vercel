'use client'
import { useEffect } from 'react'

const prefix = 'foodie:bookmark-position:'
type Position = { restaurantId: number | string; top: number; y: number; at: number }

export function saveBookmarkPosition(list: string, restaurantId: number | string, card: HTMLElement) {
  try {
    const position: Position = { restaurantId, top: card.getBoundingClientRect().top, y: window.scrollY, at: Date.now() }
    sessionStorage.setItem(prefix + list, JSON.stringify(position))
  } catch { /* Navigation remains available without browser storage. */ }
}

export function useBookmarkScroll(list: string, ready: boolean, cardIdPrefix = 'bookmark-restaurant-') {
  useEffect(() => {
    if (!ready) return
    const key = prefix + list
    let position: Position
    let raw: string | null
    try {
      raw = sessionStorage.getItem(key)
      if (!raw) return
      position = JSON.parse(raw)
      const validId = typeof position.restaurantId === 'string' ? /^[a-zA-Z0-9_-]{1,200}$/.test(position.restaurantId) : Number.isSafeInteger(position.restaurantId)
      if (!validId || !Number.isFinite(position.top) || !Number.isFinite(position.y) || position.y < 0 || !Number.isFinite(position.at) || Date.now() - position.at > 24 * 60 * 60 * 1000) {
        sessionStorage.removeItem(key)
        return
      }
    } catch { return }
    let cancelled = false
    let frame = 0
    const consume = () => {
      try { if (sessionStorage.getItem(key) === raw) sessionStorage.removeItem(key) } catch {}
    }
    const cancel = () => { cancelled = true; consume() }
    for (const event of ['wheel', 'touchstart', 'keydown', 'pointerdown']) window.addEventListener(event, cancel, { passive: true })
    void document.fonts.ready.then(() => {
      if (cancelled) return
      frame = requestAnimationFrame(() => {
        frame = requestAnimationFrame(() => {
          if (cancelled) return
          const card = document.getElementById(cardIdPrefix + position.restaurantId)
          const hasCards = !!document.querySelector('[data-restaurant-id]')
          const top = card ? window.scrollY + card.getBoundingClientRect().top - position.top : hasCards ? position.y : 0
          window.scrollTo({ top: Math.max(0, top), behavior: 'instant' })
          consume()
        })
      })
    })
    return () => {
      cancelled = true
      cancelAnimationFrame(frame)
      for (const event of ['wheel', 'touchstart', 'keydown', 'pointerdown']) window.removeEventListener(event, cancel)
    }
  }, [list, ready, cardIdPrefix])
}
