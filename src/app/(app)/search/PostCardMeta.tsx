
import clsx from 'clsx'
import Link from 'next/link'
import { FC } from 'react'
import {TPostSummary} from "@/data/types";
import LocalDate from "@/components/LocalDate";

interface Props {
  className?: string
  post: TPostSummary
}

const PostCardMeta: FC<Props> = ({ className, post }) => {

  return (
      <div className={clsx('post-card-meta flex flex-wrap items-center text-xs/6', className)}>
          <div className="relative flex items-center gap-x-2.5">
              <Link href={`/blogs?c=author&s=${post.authorNickname}`} className="absolute inset-0" />
              <span className="block font-semibold text-neutral-900 dark:text-neutral-300">{post.authorNickname}</span>
          </div>
          <>
              <span className="mx-1.5 font-medium text-neutral-500 dark:text-neutral-400">·</span>
              <span className="font-normal text-neutral-500 dark:text-neutral-400">
                <LocalDate date={post.updatedAt} />
              </span>
          </>
      </div>
  )
}

export default PostCardMeta
