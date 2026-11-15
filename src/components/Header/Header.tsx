'use client'
import { getNavigation, TNavigationItem } from '@/data/navigation'
import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from '@headlessui/react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import AvatarDropdown from './AvatarDropdown'
import SearchModal from './SearchModal'
import { clientFetch } from '@/lib/clientFetch'
function MenuLinks({ items, close }: { items: TNavigationItem[]; close?: () => void }) {
  return items.map((item, i) =>
    item.children ? (
      <div key={item.id || i}>
        <p className="kr-nav-group">{item.name}</p>
        <MenuLinks items={item.children} close={close} />
      </div>
    ) : (
      <Link key={item.id || i} href={item.href || '/'} onClick={close}>
        {item.name}
      </Link>
    )
  )
}
export default function Header({ className }: { bottomBorder?: boolean; className?: string }) {
  const [menu, setMenu] = useState<TNavigationItem[]>([])
  const [open, setOpen] = useState(false)
  const pathname = usePathname()
  useEffect(() => {
    let cancelled = false
    async function load() {
      const response = await clientFetch('/me').catch(() => null)
      const user = response?.ok ? await response.json() : null
      const navigation = await getNavigation(user?.role)
      if (!cancelled) setMenu(navigation)
    }
    void load()
    return () => { cancelled = true }
  }, [pathname])
  return (
    <header className={'kr-header ' + (className || '')}>
      <div className="kr-utility">
        <div className="kr-container">동료와 함께 발견하는 우리 주변의 맛집</div>
      </div>
      <div className="kr-container kr-header-row">
        <Link href="/" className="kr-logo" aria-label="오늘뭐먹지 홈">
          <Image src="/images/logo/main_01.png" width={500} height={200} alt="오늘뭐먹지" className="kr-logo-desktop" />
          <Image src="/images/logo/mobile_01.png" width={200} height={80} alt="오늘뭐먹지" className="kr-logo-mobile" />
        </Link>
        <div className="kr-header-actions">
          <SearchModal />
          <div className="kr-header-account">
            <AvatarDropdown />
          </div>
          <Link href="/post/new" className="kr-button kr-header-write">
            후기 등록
          </Link>
          <button
            className="kr-button kr-mobile-trigger"
            onClick={() => setOpen(true)}
            aria-label="전체 메뉴 열기"
            aria-expanded={open}
          >
            메뉴
          </button>
        </div>
      </div>
      <nav
        className="kr-container kr-header-nav"
        aria-label="주 메뉴"
        onKeyDown={(e) => {
          if (e.key === 'Escape') {
            const details = (e.target as HTMLElement).closest('details')
            details?.removeAttribute('open')
            details?.querySelector('summary')?.focus()
          }
        }}
      >
        {menu.map((item) =>
          item.children ? (
            <details
              key={item.id}
              onPointerEnter={(event) => {
                if (event.pointerType !== 'mouse') return
                const current = event.currentTarget
                current.parentElement?.querySelectorAll('details[open]').forEach((details) => {
                  if (details !== current) details.removeAttribute('open')
                })
                current.open = true
              }}
              onPointerLeave={(event) => {
                if (event.pointerType === 'mouse') event.currentTarget.open = false
              }}
              onBlur={(event) => {
                if (!event.currentTarget.contains(event.relatedTarget)) event.currentTarget.open = false
              }}
            >
              <summary>{item.name}</summary>
              <div
                className={`kr-nav-panel${item.type === 'mega-menu' ? ' kr-nav-panel-columns' : ''}`}
                onClick={(e) => {
                  if ((e.target as HTMLElement).closest('a'))
                    (e.currentTarget.parentElement as HTMLDetailsElement).open = false
                }}
              >
                <MenuLinks items={item.children} />
              </div>
            </details>
          ) : (
            <Link className={item.id === 'register-restaurant' ? 'kr-nav-register-start' : undefined} key={item.id} href={item.href || '/'} aria-current={pathname === item.href ? 'page' : undefined}>
              {item.name}
            </Link>
          )
        )}
      </nav>
      <Dialog open={open} onClose={() => setOpen(false)} className="kr-dialog">
        <DialogBackdrop className="kr-dialog-backdrop" />
        <div className="kr-dialog-position">
          <DialogPanel className="kr-dialog-panel">
            <div className="kr-actions" style={{ justifyContent: 'space-between' }}>
              <DialogTitle>전체 메뉴</DialogTitle>
              <button className="kr-button" onClick={() => setOpen(false)}>
                닫기
              </button>
            </div>
            <div className="mt-5">
              <AvatarDropdown />
            </div>
            <nav className="kr-mobile-nav" aria-label="모바일 주 메뉴">
              <MenuLinks items={menu} close={() => setOpen(false)} />
            </nav>
          </DialogPanel>
        </div>
      </Dialog>
    </header>
  )
}
