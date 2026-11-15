'use client'

import VerifyIcon from '@/components/VerifyIcon'
import Avatar from '@/shared/Avatar'
import { LockClosedIcon} from '@heroicons/react/24/outline'
import clsx from 'clsx'
import Link from 'next/link'

const PageHeader = ({ className }: { className?: string }) => {

  return (
    <div className={clsx('w-full', className)}>
      <div className="relative h-20 w-full md:h-30 2xl:h-42" />
      <div className="container -mt-10 lg:-mt-16">
        <div className="relative flex flex-col items-start gap-6 rounded-3xl border border-transparent bg-white p-5 shadow-xl md:flex-row md:rounded-4xl lg:p-8 dark:border-neutral-700 dark:bg-neutral-900">
          {/* AVATAR */}
          <Avatar
            alt='CC'
            src="/images/influencer/cc/avatar.png"
            width={128}
            height={128}
            className="shrink-0 rounded-full shadow-2xl ring-4 ring-white lg:w-32"
            sizes="128px"
          />

          {/* INFO */}
          <div className="grow lg:ps-2">
            <div className="max-w-(--breakpoint-sm) space-y-3.5">
              <div className="flex items-center lg:gap-x-0.5">
                <h2 className="text-2xl font-semibold lg:text-3xl">사내커플 이과장</h2>
                <VerifyIcon iconClass="size-6 lg:size-7" />
              </div>
              <p className="text-lg text-neutral-600 dark:text-neutral-400">사내커플의 비밀스런 데이트 장소, 소문나면 안되는데... ㅠ</p>
              <Link href="#" className="flex items-center gap-x-2 text-xs text-neutral-500 dark:text-neutral-400">
                <LockClosedIcon className="size-4" />
                <span className="font-medium text-neutral-700 dark:text-neutral-300">쉿! 소문내지 마세요~</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PageHeader
