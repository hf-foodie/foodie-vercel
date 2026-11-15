
import clsx from 'clsx'
import Link from 'next/link'
import { FC } from 'react'
import LocalDate from "@/components/LocalDate";
import {TMagazine} from "@/data/types";

interface Props {
    className?: string
    updated_at: TMagazine['updated_at']
    nickname: TMagazine['nickname']
}

const PostCardMeta: FC<Props> = ({ className, nickname, updated_at }) => {

  return (
    <div className={clsx('post-card-meta flex flex-wrap items-center text-xs/6', className)}>
      <div className="relative flex items-center gap-x-2.5">
        <Link href={`/blogs?c=author&s=${encodeURIComponent(nickname)}`} className="absolute inset-0" />
        <span className="block font-semibold text-neutral-900 dark:text-neutral-300 text-base">{nickname}</span>
      </div>
      <>
        <span className="mx-1.5 font-medium text-neutral-500 dark:text-neutral-400">·</span>
        <span className="font-normal text-neutral-500 dark:text-neutral-400 text-base">
          <LocalDate date={updated_at} />
        </span>
      </>
    </div>
  )
}

export default PostCardMeta
