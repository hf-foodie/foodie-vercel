'use client'

import clsx from "clsx";
import Avatar from "@/shared/Avatar";
import VerifyIcon from "@/components/VerifyIcon";
import { Link } from "@/shared/link";
import ButtonCircle from '@/shared/ButtonCircle'
import { Dropdown, DropdownButton, DropdownItem, DropdownMenu } from '@/shared/dropdown'
import { GlobeAltIcon } from '@heroicons/react/24/outline'
import {
    CopyLinkIcon,
    Facebook01Icon,
    Flag03Icon,
    Mail01Icon, MoreHorizontalIcon,
    NewTwitterIcon, Share03Icon,
    ViewOffSlashIcon
} from "@hugeicons/core-free-icons";
import {HugeiconsIcon} from "@hugeicons/react";
import {useState} from "react";

const PageHeader = ({ className }: { className?: string }) => {

  return (
    <div className={clsx('w-full', className)}>
      <div className="relative h-20 w-full md:h-30 2xl:h-42" />
      <div className="container -mt-10 lg:-mt-16">
        <div className="relative flex flex-col items-start gap-6 rounded-3xl border border-transparent bg-white p-5 shadow-xl md:flex-row md:rounded-4xl lg:p-8 dark:border-neutral-700 dark:bg-neutral-900">
          {/* AVATAR */}
          <Avatar
            alt='맛잘알 김인턴'
            src="/images/influencer/intern/avatar.png"
            width={128}
            height={128}
            className="shrink-0 rounded-full shadow-2xl ring-4 ring-white lg:w-32"
            sizes="128px"
          />

          {/* INFO */}
          <div className="grow lg:ps-2">
            <div className="max-w-(--breakpoint-sm) space-y-3.5">
              <div className="flex items-center lg:gap-x-0.5">
                <h2 className="text-2xl font-semibold lg:text-3xl">맛잘알 김인턴</h2>
                <VerifyIcon iconClass="size-6 lg:size-7" />
              </div>
              <p className="text-lg text-neutral-600 dark:text-neutral-400">젊은 입맛으로 확보된 맛집 정보를 주택금융공사 임직원에게 전달해드릴게요</p>
              <Link href="#" className="flex items-center gap-x-2 text-xs text-neutral-500 dark:text-neutral-400">
                <GlobeAltIcon className="size-4" />
                <span className="font-medium text-neutral-700 dark:text-neutral-300">https://example.com/me</span>
              </Link>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}

export default PageHeader
