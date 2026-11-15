import { customFetch } from '@/lib/fetch'
import { apiBase } from '@/lib/server-session'
import { cookies } from 'next/headers'
export async function validateAuth() {
  const token = (await cookies()).get('accessToken')?.value
  if (!token) return null
  const response = await customFetch(`${apiBase()}/me`)
  if (response.status === 401 || response.status === 403) return null
  if (!response.ok) throw new Error('로그인 상태를 확인할 수 없습니다.')
  return token
}
