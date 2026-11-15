'use client'

import VerifyIcon from '@/components/VerifyIcon'
import Avatar from '@/shared/Avatar'
import { GlobeAltIcon } from '@heroicons/react/24/outline'
import clsx from 'clsx'
import Link from 'next/link'

const PageHeader = ({ className }: { className?: string }) => {

  return (
    <div className={clsx('w-full', className)}>
      <div className="relative h-20 w-full md:h-30 2xl:h-42" />
      <div className="container -mt-10 lg:-mt-16">
        <div className="relative flex flex-col items-start gap-6 rounded-3xl border border-transparent bg-white p-5 shadow-xl md:flex-row md:rounded-4xl lg:p-8 dark:border-neutral-700 dark:bg-neutral-900">
          <Avatar
            alt='사장'
            src="/images/influencer/ceo/avatar.png"
            width={128}
            height={128}
            className="shrink-0 rounded-full shadow-2xl ring-4 ring-white lg:w-32"
            sizes="128px"
          />

          {/* INFO */}
          <div className="grow lg:ps-2">
            <div className="max-w-(--breakpoint-sm) space-y-3.5">
              <div className="flex items-center lg:gap-x-0.5">
                <h2 className="text-2xl font-semibold lg:text-3xl">사장</h2>
                <VerifyIcon iconClass="size-6 lg:size-7" />
              </div>
              <p className="text-lg text-neutral-600 dark:text-neutral-400">우리 직원들은 어떤 음식을 좋아하려나, 사장님과 직원들이 함께한 맛집 소개</p>
              <Link href="#" className="flex items-center gap-x-2 text-xs text-neutral-500 dark:text-neutral-400">
                <GlobeAltIcon className="size-4" />
                <span className="font-medium text-neutral-700 dark:text-neutral-300">khkim@hf.go.kr</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PageHeader
