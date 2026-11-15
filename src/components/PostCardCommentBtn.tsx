import { Link } from '@/shared/link'
import { Comment01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import clsx from 'clsx'
import { FC } from 'react'

interface Props {
  href?: string
  className?: string
  commentCount?: number
  postId: string
}

const PostCardCommentBtn: FC<Props> = ({ className, href, commentCount, postId }) => {
  if (commentCount === undefined) {
    return null
  }

  return (
    <Link
      href={href || `/posts/${postId}#comments`}
      className={clsx(
        'post-card-comment-btn flex h-11 min-w-16 items-center rounded-md bg-neutral-50 ps-2 pe-3 text-xs transition-colors hover:bg-teal-50 hover:text-teal-600 dark:bg-white/10 dark:hover:bg-white/10 dark:hover:text-teal-500',
        className
      )}
      title="댓글 보기"
      aria-label={'댓글 ' + commentCount + '개 보기'}
    >
      <HugeiconsIcon icon={Comment01Icon} size={18} />
      <span className="ms-2">{commentCount}</span>
    </Link>
  )
}

export default PostCardCommentBtn
