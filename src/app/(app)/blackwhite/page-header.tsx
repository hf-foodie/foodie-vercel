'use client'

import VerifyIcon from '@/components/VerifyIcon'
import Avatar from '@/shared/Avatar'
import ButtonCircle from '@/shared/ButtonCircle'
import { Dropdown, DropdownButton, DropdownItem, DropdownMenu } from '@/shared/dropdown'
import { GlobeAltIcon } from '@heroicons/react/24/outline'
import {
  CopyLinkIcon,
  Facebook01Icon,
  Flag03Icon,
  Mail01Icon,
  MoreHorizontalIcon,
  NewTwitterIcon,
  Share03Icon,
  ViewOffSlashIcon,
} from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import clsx from 'clsx'
import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'

const PageHeader = ({ className }: { className?: string }) => {

  return (
    <div className={clsx('w-full', className)}>
      <div className="relative h-20 w-full md:h-30 2xl:h-42" />
      <div className="container -mt-10 lg:-mt-16">
        <div className="relative flex flex-col items-start gap-6 rounded-3xl border border-transparent bg-white p-5 shadow-xl md:flex-row md:rounded-4xl lg:p-8 dark:border-neutral-700 dark:bg-neutral-900">
          {/* AVATAR */}
          <Avatar
            alt='흑백요리사'
            src="/images/blackwhite/avatar.png"
            width={128}
            height={128}
            className="shrink-0 rounded-full shadow-2xl ring-4 ring-white lg:w-32"
            sizes="128px"
          />

          {/* INFO */}
          <div className="grow lg:ps-2">
            <div className="max-w-(--breakpoint-sm) space-y-3.5">
              <div className="flex items-center lg:gap-x-0.5">
                <h2 className="text-2xl font-semibold lg:text-3xl">흑백요리사</h2>
                <VerifyIcon iconClass="size-6 lg:size-7" />
              </div>
              <p className="text-lg text-neutral-600 dark:text-neutral-400">나도 못가봣지만 언젠가 가보고 싶은 세기의 흑백요리사 셰프의 식당</p>
              <Link href="#" className="flex items-center gap-x-2 text-xs text-neutral-500 dark:text-neutral-400">
                <GlobeAltIcon className="size-4" />
                <span className="font-medium text-neutral-700 dark:text-neutral-300">흑백요리사: 요리 계급 전쟁</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function ShareDropdown({ handle }: { handle: string }) {
  const socialsShare = [
    {
      name: 'Facebook',
      href: '#',
      icon: Facebook01Icon,
    },
    {
      name: 'Email',
      href: '#',
      icon: Mail01Icon,
    },
    {
      name: 'Twitter',
      href: '#',
      icon: NewTwitterIcon,
    },
  ]

  return (
    <Dropdown>
      <DropdownButton as={ButtonCircle} outline className="size-10">
        <HugeiconsIcon icon={Share03Icon} size={20} />
      </DropdownButton>
      <DropdownMenu>
        {socialsShare.map((item, index) => (
          <DropdownItem key={index} href={item.href}>
            <HugeiconsIcon icon={item.icon} size={20} data-slot="icon" />
            {item.name}
          </DropdownItem>
        ))}
      </DropdownMenu>
    </Dropdown>
  )
}

export default PageHeader
