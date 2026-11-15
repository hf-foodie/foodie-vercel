import clsx from 'clsx'
import { FC } from 'react'
import BookmarkBtn from './BookmarkBtn'

interface Props {
  className?: string
  bookmarkClass?: string
  readingTime?: number
  bookmarked?: boolean
  restaurantId?: number
  postId?: string
}

const PostCardSaveBtn: FC<Props> = ({ className, bookmarkClass, readingTime, bookmarked, restaurantId, postId }) => {
  return (
    <div className={clsx('post-card-save-btn flex items-center gap-x-2 text-xs', className)}>
      {readingTime ? <span>{readingTime} viewd!</span> : null}
      <BookmarkBtn className={bookmarkClass} bookmarked={bookmarked} restaurantId={restaurantId} postId={postId} />
    </div>
  )
}

export default PostCardSaveBtn
