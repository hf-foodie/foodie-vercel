import clsx from 'clsx'
import { FC } from 'react'
import BookmarkBtn from "@/components/BookmarkBtn";
import {TPost} from "@/data/types";

interface Props {
  className?: string
  bookmarkClass?: string
  viewCount?: number
  bookmarked?: boolean
  postId?: TPost['postId']
}

const PostCardBookmarkBtn: FC<Props> = ({ className, bookmarkClass, viewCount, bookmarked, postId }) => {
  return (
    <div className={clsx('post-card-save-btn flex items-center gap-x-2 text-xs', className)}>
      {viewCount ? <span>{viewCount} viewd!</span> : null}
      <BookmarkBtn className={bookmarkClass} bookmarked={bookmarked} postId={postId} />
    </div>
  )
}

export default PostCardBookmarkBtn
