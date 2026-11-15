'use client'
import { clientFetch } from '@/lib/clientFetch'
import { setBookmark, useBookmark } from '@/lib/bookmarks'
import { Bookmark02Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import clsx from 'clsx'
import { useEffect, useState } from 'react'
interface Props { className?: string; bookmarked?: boolean; postId?: string; restaurantId?: number }
export default function BookmarkBtn({className, bookmarked, postId, restaurantId}: Props) {
  const [resolved, setResolved] = useState(restaurantId)
  const [message, setMessage] = useState('')
  const {saved, busy} = useBookmark(restaurantId ?? resolved, bookmarked)
  useEffect(() => {
    if (restaurantId !== undefined || !postId) return
    let active = true
    clientFetch(`/posts/${encodeURIComponent(postId)}/bookmark`).then(async response => {
      if (!response.ok) throw new Error()
      const state = await response.json()
      if (active) setResolved(state.restaurantId)
    }).catch(() => { if (active) setMessage('저장 정보를 불러오지 못했습니다. 새로고침해주세요.') })
    return () => {active = false}
  }, [postId, restaurantId])
  if (restaurantId === undefined && !postId) return null
  const id = restaurantId ?? resolved
  return (
    <span className="inline-flex flex-wrap items-center gap-2">
      <button type="button" disabled={busy || id === undefined}
        className={clsx('relative flex size-11 shrink-0 items-center justify-center rounded-md transition-colors disabled:opacity-50', saved ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-200' : 'bg-neutral-50 hover:bg-neutral-100 dark:bg-white/10', className)}
        title={saved ? '맛집 저장 해제' : '맛집 저장'} aria-label={saved ? '맛집 저장 해제' : '맛집 저장'} aria-pressed={saved} aria-busy={busy}
        onClick={async () => { if (id === undefined) return; setMessage(''); try {await setBookmark(id, !saved)} catch (e) {setMessage(e instanceof Error ? e.message : '저장하지 못했습니다. 다시 시도해주세요.')} }}>
        <HugeiconsIcon icon={Bookmark02Icon} size={18} strokeWidth={1.75} fill={saved ? 'currentColor' : 'none'} aria-hidden="true" />
      </button>
      {message && <span role="alert" className="text-sm text-red-700">{message}</span>}
    </span>
  )
}
