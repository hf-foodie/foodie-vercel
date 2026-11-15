'use client'
import { clientFetch } from '@/lib/clientFetch'

import { Link } from '@/shared/link'
import { Popover, PopoverButton, PopoverPanel } from '@headlessui/react'
import {
  Logout01Icon,
  Bookmark02Icon,
  Task01Icon,
  UserIcon,
} from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import clsx from 'clsx'
import { useEffect, useRef, useState } from 'react'

interface Props {
  className?: string
}

interface UserData {
  id: string,
  email: string,
  nickname: string,
  birthYear: string,
  role: string,
  status: string
}

export default function AvatarDropdown({ className }: Props) {
  const triggerRef = useRef<HTMLButtonElement>(null)
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const cancelClose = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current)
    closeTimer.current = null
  }
  const scheduleClose = (close: () => void) => {
    cancelClose()
    closeTimer.current = setTimeout(close, 180)
  }
  useEffect(() => () => {
    if (closeTimer.current) clearTimeout(closeTimer.current)
  }, [])
  const [userData, setUserData] = useState<UserData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchUserData = async () => {

      try {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || ''
        const response = await clientFetch(`${baseUrl}/me`, {
          headers: {

          },
        })

        if (response.ok) {
          const data = await response.json()
          setUserData(data)
        }
      } catch (error) {
        console.error('Failed to fetch user data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchUserData()
  }, [])

  const [loggingOut, setLoggingOut] = useState(false)
  const handleLogout = async (e: React.MouseEvent) => {
    e.preventDefault()
    if (loggingOut) return
    setLoggingOut(true)
    try {
      const response = await clientFetch('/sessions/current', { method: 'DELETE' })
      if (!response.ok) throw new Error('로그아웃을 완료하지 못했습니다. 다시 시도해주세요.')
      sessionStorage.removeItem('isLoggedIn')
      window.location.assign('/login')
    } catch {
      alert('로그아웃을 완료하지 못했습니다. 연결을 확인하고 다시 시도해주세요.')
    } finally { setLoggingOut(false) }
  }

  const user = userData
    ? {
        id: userData.id,
        email: userData.email,
        nickname: userData.nickname,
        birthYear: userData.birthYear,
        role: userData.role,
        status: userData.status
      }
    : null

  if (isLoading) return null

  if (!user) {
    return (
      <div className={className}>
        <Link
          href="/login"
          className="text-sm font-medium text-neutral-700 hover:text-primary-6000 dark:text-neutral-300 dark:hover:text-primary-500"
        >
          로그인
        </Link>
        <span className="mx-2 text-neutral-300">|</span>
        <Link
          href="/signup"
          className="text-sm font-medium text-neutral-700 hover:text-primary-6000 dark:text-neutral-300 dark:hover:text-primary-500"
        >
          회원가입
        </Link>
        <span className="mx-2 text-neutral-300">|</span>
        <Link
          href="/forgot-password"
          className="text-sm font-medium text-neutral-700 hover:text-primary-6000 dark:text-neutral-300 dark:hover:text-primary-500"
        >
          비밀번호찾기
        </Link>
      </div>
    )
  }

  return (
    <div className={clsx('flex items-center gap-3', className)}>
      <Popover
        className="relative"
      >
        {({ open, close }) => (
          <>
            <PopoverButton
              ref={triggerRef}
              className="relative"
              onPointerEnter={(event) => {
                if (event.pointerType !== 'mouse') return
                cancelClose()
                if (!open) triggerRef.current?.click()
              }}
              onPointerLeave={(event) => {
                if (event.pointerType === 'mouse') scheduleClose(close)
              }}
            >
              <strong className="font-bold text-blue-800 dark:text-blue-200">{user.nickname}</strong>님의 접속을 환영합니다
            </PopoverButton>

            <PopoverPanel
              onPointerEnter={cancelClose}
              onPointerLeave={(event) => {
                if (event.pointerType === 'mouse') scheduleClose(close)
              }}
              transition
              anchor={{
                to: 'bottom end',
                gap: 0,
              }}
              className={clsx(
                'z-80 w-80 max-w-[calc(100vw-32px)] pt-4 rounded-lg transition duration-200 ease-in-out data-closed:translate-y-1 data-closed:opacity-0'
              )}
            >
                <div className="relative flex flex-col gap-y-6 bg-white px-6 py-7 shadow-lg ring-1 ring-black/5 rounded-3xl dark:bg-neutral-800">
                  <Link
                    href={`/myaccount`}
                    className="-m-3 flex items-center gap-x-4 rounded-lg p-2 transition duration-150 ease-in-out hover:bg-neutral-100 focus:outline-hidden focus-visible:ring-3 focus-visible:ring-orange-500/50 dark:hover:bg-neutral-700"
                  >
                    <div className="flex shrink-0 items-center justify-center text-neutral-500 dark:text-neutral-300">
                      <HugeiconsIcon icon={UserIcon} size={24} strokeWidth={1.5} />
                    </div>
                    <p className="text-sm font-medium">계정 관리</p>
                  </Link>

                  <Link href="/bookmarks" className="-m-3 flex items-center gap-x-4 rounded-lg p-2 transition duration-150 ease-in-out hover:bg-neutral-100 focus:outline-hidden focus-visible:ring-3 focus-visible:ring-orange-500/50 dark:hover:bg-neutral-700">
                    <div className="flex shrink-0 items-center justify-center text-neutral-500 dark:text-neutral-300">
                      <HugeiconsIcon icon={Bookmark02Icon} size={24} strokeWidth={1.5} aria-hidden="true" />
                    </div>
                    <p className="text-sm font-medium">저장한 맛집</p>
                  </Link>
                  <Link
                    href={'/communication?mine=true'}
                    className="-m-3 flex items-center gap-x-4 rounded-lg p-2 transition duration-150 ease-in-out hover:bg-neutral-100 focus:outline-hidden focus-visible:ring-3 focus-visible:ring-orange-500/50 dark:hover:bg-neutral-700"
                  >
                    <div className="flex shrink-0 items-center justify-center text-neutral-500 dark:text-neutral-300">
                      <HugeiconsIcon icon={Task01Icon} size={24} strokeWidth={1.5} />
                    </div>
                    <p className="text-sm font-medium">나의 문의사항</p>
                  </Link>
                  <button
                    onClick={handleLogout}
                    disabled={loggingOut}
                    className="-m-3 flex w-full items-center rounded-lg p-2 transition duration-150 ease-in-out hover:bg-neutral-100 focus:outline-hidden focus-visible:ring-3 focus-visible:ring-orange-500/50 dark:hover:bg-neutral-700"
                  >
                    <div className="flex shrink-0 items-center justify-center text-neutral-500 dark:text-neutral-300">
                      <HugeiconsIcon icon={Logout01Icon} size={24} strokeWidth={1.5} />
                    </div>
                    <p className="ms-4 text-sm font-medium">{'로그아웃'}</p>
                  </button>
                </div>
              </PopoverPanel>
          </>
        )}
      </Popover>
    </div>
  )
}
