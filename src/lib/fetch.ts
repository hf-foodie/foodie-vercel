import { cookies } from 'next/headers'
import 'server-only'
export async function customFetch(url: string, options: RequestInit = {}) {
  const store = await cookies()
  const headers = new Headers(options.headers)
  const token = store.get('accessToken')?.value
  if (token) headers.set('Authorization', `Bearer ${token}`)
  return fetch(url, { ...options, headers, cache: 'no-store' })
}
