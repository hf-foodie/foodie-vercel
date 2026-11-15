'use client'
import { useEffect } from 'react'

const storageKey = 'foodie:search-return-position'
type Position = { list: string; postId: number; top: number; scrollY: number }

export function saveSearchPosition(list: string, postId: number, link: HTMLElement) {
  try {
    const position: Position = { list, postId, top: link.getBoundingClientRect().top, scrollY: window.scrollY }
    sessionStorage.setItem(storageKey, JSON.stringify(position))
  } catch {
    /* Navigation also works when browser storage is unavailable. */
  }
}

export function useSearchScroll(list: string, ready: boolean) {
  useEffect(() => {
    if (!ready) return
    let raw: string | null
    let position: Position
    try {
      raw = sessionStorage.getItem(storageKey)
      if (!raw) return
      position = JSON.parse(raw)
      if (
        position.list !== list ||
        !Number.isSafeInteger(position.postId) ||
        !Number.isFinite(position.top) ||
        !Number.isFinite(position.scrollY) ||
        position.scrollY < 0
      )
        return
    } catch {
      return
    }
    let cancelled = false
    let frame = 0
    const consume = () => {
      try {
        if (sessionStorage.getItem(storageKey) === raw) sessionStorage.removeItem(storageKey)
      } catch {
        /* Storage restrictions must not prevent scrolling. */
      }
    }
    const cancel = () => {
      cancelled = true
      consume()
    }
    window.addEventListener('wheel', cancel, { passive: true })
    window.addEventListener('touchstart', cancel, { passive: true })
    window.addEventListener('keydown', cancel)
    window.addEventListener('pointerdown', cancel)
    void document.fonts.ready.then(() => {
      if (cancelled) return
      frame = requestAnimationFrame(() => {
        frame = requestAnimationFrame(() => {
          if (cancelled) return
          const link = document.getElementById('search-post-' + position.postId)
          const hasRows = !!document.querySelector('.kr-food-card')
          const top = link
            ? window.scrollY + link.getBoundingClientRect().top - position.top
            : hasRows
              ? position.scrollY
              : 0
          window.scrollTo({ top: Math.max(0, top), behavior: 'instant' })
          consume()
        })
      })
    })
    return () => {
      cancelled = true
      cancelAnimationFrame(frame)
      window.removeEventListener('wheel', cancel)
      window.removeEventListener('touchstart', cancel)
      window.removeEventListener('keydown', cancel)
      window.removeEventListener('pointerdown', cancel)
    }
  }, [list, ready])
}
