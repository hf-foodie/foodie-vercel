import { apiBase, refreshSession, sessionCookies } from '@/lib/server-session'
import { NextRequest, NextResponse } from 'next/server'
export async function proxy(request: NextRequest) {
  const refresh = request.cookies.get('refreshToken')?.value
  if (!refresh) return NextResponse.next()
  try {
    const access = request.cookies.get('accessToken')?.value
    const current = access
      ? await fetch(`${apiBase()}/me`, {
          headers: { Authorization: `Bearer ${access}` },
          cache: 'no-store',
          signal: AbortSignal.timeout(15000),
        })
      : null
    if (current && current.status !== 401) return NextResponse.next()
    const pair = await refreshSession(refresh)
    if (pair) {
      request.cookies.set('accessToken', pair.accessToken)
      request.cookies.set('refreshToken', pair.refreshToken)
    } else {
      request.cookies.delete('accessToken')
      request.cookies.delete('refreshToken')
    }
    const headers = new Headers(request.headers)
    headers.set('cookie', request.cookies.toString())
    return sessionCookies(NextResponse.next({ request: { headers } }), pair)
  } catch {
    return NextResponse.next()
  }
}
export const config = { matcher: ['/((?!api|_next|images|favicon.ico|.*\\..*).*)'] }
