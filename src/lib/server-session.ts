import { NextResponse } from 'next/server'
export const apiBase = () => {
  const value = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL
  if (!value) throw new Error('API_URL is required')
  return value.replace(/\/$/, '')
}
export type TokenPair = { accessToken: string; refreshToken: string }
const pending = new Map<string, Promise<TokenPair | null>>()
export function refreshSession(token: string): Promise<TokenPair | null> {
  const existing = pending.get(token)
  if (existing) return existing
  const work = (async () => {
    const res = await fetch(`${apiBase()}/session-tokens`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken: token }),
      cache: 'no-store',
      signal: AbortSignal.timeout(15000),
    })
    if (res.status === 401 || res.status === 403) return null
    if (!res.ok) throw new Error('인증 서버에 연결할 수 없습니다.')
    return (await res.json()) as TokenPair
  })().finally(() => pending.delete(token))
  pending.set(token, work)
  return work
}
export function sessionCookies(response: NextResponse, pair: TokenPair | null) {
  for (const name of ['accessToken', 'refreshToken'] as const) {
    response.cookies.set(name, pair?.[name] || '', {
      httpOnly: true,
      secure: process.env.PROTOCOL !== 'http' && process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      ...(pair ? {} : { maxAge: 0 }),
    })
  }
  return response
}
