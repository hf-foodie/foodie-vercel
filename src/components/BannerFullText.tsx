'use client'

import { useEffect, useId, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

/** A portal keeps full text outside the clipped carousel without changing its height. */
export default function BannerFullText({ text, label, lines = 2 }: { text: string; label: string; lines?: number }) {
  const trigger = useRef<HTMLButtonElement>(null)
  const panel = useRef<HTMLDivElement>(null)
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const pinned = useRef(false)
  const skipFocus = useRef(false)
  const id = useId()
  const [position, setPosition] = useState<{ top: number; left: number; width: number } | null>(null)
  const cancelClose = () => { if (timer.current) clearTimeout(timer.current) }
  const close = () => { cancelClose(); pinned.current = false; setPosition(null) }
  const show = (onlyTruncated = false) => {
    const el = trigger.current
    if (!el || (onlyTruncated && el.scrollHeight <= el.clientHeight + 1 && el.scrollWidth <= el.clientWidth + 1)) return
    cancelClose()
    const box = el.getBoundingClientRect()
    const width = Math.min(360, window.innerWidth - 32)
    setPosition({ width, left: Math.max(16, Math.min(box.left + box.width / 2 - width / 2, window.innerWidth - width - 16)), top: Math.max(16, Math.min(box.bottom + 8, window.innerHeight - Math.min(240, window.innerHeight - 32) - 16)) })
  }
  const leave = () => { if (!pinned.current) timer.current = setTimeout(close, 180) }
  useEffect(() => {
    if (!position) return
    const dismiss = (event: Event) => {
      if (event.target instanceof Node && (panel.current?.contains(event.target) || trigger.current?.contains(event.target))) return
      pinned.current = false; setPosition(null)
    }
    const escape = (event: KeyboardEvent) => { if (event.key === 'Escape') { pinned.current = false; setPosition(null); if (document.activeElement !== trigger.current) { skipFocus.current = true; trigger.current?.focus() } } }
    document.addEventListener('pointerdown', dismiss)
    document.addEventListener('scroll', dismiss, true)
    document.addEventListener('keydown', escape)
    window.addEventListener('resize', dismiss)
    return () => { document.removeEventListener('pointerdown', dismiss); document.removeEventListener('scroll', dismiss, true); document.removeEventListener('keydown', escape); window.removeEventListener('resize', dismiss) }
  }, [position])
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current) }, [])
  return <>
    <button ref={trigger} type="button" className="kr-banner-full-text" style={{ WebkitLineClamp: lines }} aria-label={`${label} 전체 보기: ${text}`} aria-expanded={Boolean(position)} aria-controls={position ? id : undefined}
      onPointerEnter={event => { if (event.pointerType === 'mouse') show(true) }} onPointerLeave={leave}
      onFocus={() => { if (skipFocus.current) skipFocus.current = false; else show(true) }} onBlur={event => { if (!panel.current?.contains(event.relatedTarget)) close() }}
      onClick={() => { if (pinned.current) close(); else { pinned.current = true; show() } }}>{text}</button>
    {position && createPortal(<div id={id} ref={panel} role="region" aria-label={`${label} 전체 내용`} className="kr-banner-full-text-panel" style={position} onPointerEnter={cancelClose} onPointerLeave={leave}>
      <div className="kr-banner-full-text-heading"><strong>{label}</strong><button type="button" aria-label="전체 내용 닫기" onClick={close}>×</button></div>
      <p>{text}</p>
    </div>, document.body)}
  </>
}
