'use client'
import Link from 'next/link'
import type { ComponentProps } from 'react'
import { LockClosedIcon } from '@heroicons/react/24/outline'

export function useMemberAccess() { return { allowed: false, status: 'guest' as const, reason: '정식 서비스에서 이용 가능' } }
export function LoginNotice() {
  return <p className="kr-member-notice"><LockClosedIcon aria-hidden="true" /><span>인터넷 체험판에서는 조회·검색·맛집게임을 이용할 수 있습니다. 등록·수정·댓글·좋아요·저장은 내부망에 정식 서비스 오픈 후 이용가능합니다.</span></p>
}
const restricted = ['/restaurant/new', '/post/new', '/post/edit', '/communication/new', '/restaurant-proposals', '/restaurant/manage', '/login', '/signup', '/forgot-password', '/myaccount', '/bookmarks']
export function MemberLink({ requiresMember, ...props }: ComponentProps<typeof Link> & { requiresMember?: boolean }) {
  const href = typeof props.href === 'string' ? props.href : props.href.pathname || ''
  if (!(requiresMember || restricted.includes(href.split('?')[0]))) return <Link {...props} />
  return <button type="button" disabled className={(props.className || '') + ' kr-member-disabled'} title="내부망에 정식 서비스 오픈 후 이용가능">
    <LockClosedIcon aria-hidden="true" /><span>{props.children}<small className="kr-member-reason">정식 서비스에서 이용 가능</small></span>
  </button>
}
