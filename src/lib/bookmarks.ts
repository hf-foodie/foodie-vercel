'use client'
import { clientFetch } from '@/lib/clientFetch'
import { useEffect, useSyncExternalStore } from 'react'
export type BookmarkState = { restaurantId: number; bookmarked: boolean }
const values = new Map<number, boolean>()
const pending = new Set<number>()
const listeners = new Set<() => void>()
let loading: Promise<void> | null = null
let revision = 0
let loaded = false
const notify = () => listeners.forEach(fn => fn())
const subscribe = (listener: () => void) => { listeners.add(listener); return () => { listeners.delete(listener) } }
export function refreshBookmarks() {
  if (loading) return loading
  const started = revision
  loading = (async () => {
    const response = await clientFetch('/me/bookmarks/ids')
    if (!response.ok && response.status !== 401) return
    const ids: number[] = response.ok ? await response.json() : []
    if (started !== revision) return
    values.clear(); ids.forEach(id => values.set(id, true)); loaded = true; notify()
  })().catch(() => {}).finally(() => { loading = null })
  return loading
}
export function useBookmark(id?: number, initial = false) {
  const snapshot = useSyncExternalStore(subscribe,
    () => `${id === undefined ? initial : values.get(id) ?? (loaded ? false : initial)}:${id !== undefined && pending.has(id)}`,
    () => `${initial}:false`)
  useEffect(() => {
    void refreshBookmarks()
    window.addEventListener('focus', refreshBookmarks)
    return () => { window.removeEventListener('focus', refreshBookmarks) }
  }, [id])
  return { saved: snapshot.split(':')[0] === 'true', busy: snapshot.split(':')[1] === 'true' }
}
export async function setBookmark(id: number, saved: boolean) {
  if (pending.has(id)) return
  pending.add(id); revision++; notify()
  try {
    const response = await clientFetch(`/restaurants/${id}/bookmark`, {method: saved ? 'PUT' : 'DELETE'})
    if (response.status === 401) {
      window.location.assign('/login?next=' + encodeURIComponent(location.pathname + location.search))
      return
    }
    if (!response.ok) throw new Error('맛집 저장 상태를 변경하지 못했습니다. 다시 시도해주세요.')
    const result: BookmarkState = await response.json()
    values.set(result.restaurantId, result.bookmarked)
    revision++; notify()
    window.dispatchEvent(new CustomEvent('restaurant-bookmark-changed', {detail: result}))
  } finally { pending.delete(id); notify() }
}
