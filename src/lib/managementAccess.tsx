import 'server-only'
import { customFetch } from '@/lib/fetch'
import { apiBase } from '@/lib/server-session'
import Link from 'next/link'

export async function managementRole() {
  const response = await customFetch(apiBase() + '/me')
  if (!response.ok) return null
  const user = await response.json()
  return String(user.role || '').replace(/^ROLE_/, '')
}

export async function ManagementGuard({ children, adminOnly = false }: { children: React.ReactNode; adminOnly?: boolean }) {
  const role = await managementRole()
  if (role !== 'ADMIN' && (adminOnly || role !== 'MANAGER')) return <main className="kr-container kr-main"><h1 className="text-3xl font-bold">접근 권한이 없습니다</h1><p className="my-5">{adminOnly ? '관리자만 이용할 수 있는 통계 화면입니다.' : '매니저와 관리자만 이용할 수 있는 관리 화면입니다.'}</p><Link className="kr-button" href={role ? '/' : '/login'}>{role ? '홈으로' : '로그인'}</Link></main>
  return children
}
