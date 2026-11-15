'use client'

import BookmarkBtn from '@/components/BookmarkBtn'
import PostCardCommentBtn from '@/components/PostCardCommentBtn'
import PostCardLikeBtn from '@/components/PostCardLikeBtn'
import clsx from 'clsx'
import { FC } from 'react'

interface Props {
  likeCount: number
  liked: boolean
  bookmarked: boolean
  commentCount: number
  handle: string
  className?: string
}

const SingleMetaAction: FC<Props> = ({ className, likeCount, liked, bookmarked, commentCount, handle }) => {
  return (
    <div className={clsx('single-meta-action', className)}>
      <div className="flex flex-wrap items-center gap-x-2.5 gap-y-2">
        <PostCardLikeBtn likeCount={likeCount} liked={liked} postId={handle} />
        <PostCardCommentBtn commentCount={commentCount} postId={handle} />
        <p className="font-light text-neutral-400 sm:mx-1">/</p>
        <BookmarkBtn className="size-11!" bookmarked={bookmarked} postId={handle} />
      </div>
    </div>
  )
}

export { SingleMetaAction }
