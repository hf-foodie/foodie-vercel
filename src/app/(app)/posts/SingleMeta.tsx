import LocalDate from '@/components/LocalDate'
import clsx from 'clsx'
import Link from 'next/link'
import { FC } from 'react'
import {TPost} from "@/data/types";

interface Props {
  className?: string,
  updatedAt: TPost['updatedAt'],
  authorNickname: TPost['authorNickname'],
  viewCount: TPost['viewCount']
}

const SingleMeta: FC<Props> = ({ className, updatedAt, authorNickname, viewCount = 0 }) => {
  return (
    <div className={clsx('single-meta relative flex shrink-0 flex-wrap items-center text-sm', className)}>

      <div className="ms-3">
        <p className="block font-semibold">{authorNickname}</p>

        <div className="mt-1.5 flex items-center gap-x-2 text-xs">
          <span>
            <LocalDate date={updatedAt} options={{ year: 'numeric', month: 'long', day: 'numeric' }} />
          </span>
          <span>•</span>
          <span>{viewCount} read</span>
        </div>
      </div>

      <Link href={`/blogs?c=author&s=${encodeURIComponent(authorNickname)}`} className="absolute inset-0" />
    </div>
  )
}

export default SingleMeta
