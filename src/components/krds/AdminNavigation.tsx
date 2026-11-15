'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { clientFetch } from '@/lib/clientFetch'

export default function AdminNavigation() {
  const pathname = usePathname()
  const [role,setRole]=useState('')
  useEffect(()=>{let active=true;void clientFetch('/me').then(async r=>{if(r.ok&&active)setRole(String((await r.json()).role).replace(/^ROLE_/,''))}).catch(()=>{});return()=>{active=false}},[])
  if (!['ADMIN','MANAGER'].includes(role)) return null
  return (
    <nav className="kr-admin-nav" aria-label="관리 메뉴">
      <Link href="/management">관리 홈</Link>
      {role==='ADMIN'&&<Link href="/admin/analytics">관리자 통계</Link>}
      <Link href="/restaurant-changes" aria-current={pathname === '/restaurant-changes' ? 'page' : undefined}>
        식당 정보 수정·제안
      </Link>
      <Link href="/recommendations" aria-current={pathname === '/recommendations' ? 'page' : undefined}>
        추천 콘텐츠 관리
      </Link>
      <Link href="/curated-links" aria-current={pathname === '/curated-links' ? 'page' : undefined}>
        추천 식당 연결 관리
      </Link>
    </nav>
  )
}
