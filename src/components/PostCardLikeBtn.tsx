'use client'
import { clientFetch } from '@/lib/clientFetch'

import convertNumbThousand from '@/utils/convertNumbThousand'
import { HeartIcon } from '@heroicons/react/24/outline'
import clsx from 'clsx'
import { FC, useEffect, useState } from 'react'

interface Props {
  className?: string
  likeCount: number
  liked?: boolean
  postId: string
}

const PostCardLikeBtn: FC<Props> = ({ className, likeCount = 0, liked, postId }) => {
  const [isLiked, setisLiked] = useState(liked)

  useEffect(() => {
    setisLiked(liked)
  }, [liked])

  const handleLike = async () => {
    if (!postId) return

    const previousLiked = isLiked
    setisLiked(!isLiked)

    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || ''
      const response = await clientFetch(`${baseUrl}/posts/${postId}/like`, {
        method: previousLiked ? 'DELETE' : 'PUT',
        headers: {

        },
      })

      if (!response.ok) {
        throw new Error('Failed to update like status')
      }
    } catch (error) {
      console.error('Error updating like status:', error)
      setisLiked(previousLiked)
    }
  }

  const getDisplayLikeCount = () => {
    if (isLiked === liked) return likeCount
    if (liked) {
      // 서버에서 좋아요 상태로 온 경우, 취소하면 -1
      return isLiked ? likeCount : likeCount - 1
    } else {
      // 서버에서 좋아요 안한 상태로 온 경우, 누르면 +1
      return isLiked ? likeCount + 1 : likeCount
    }
  }

  return (
    <button
      className={clsx(
        'post-card-like-btn group flex h-11 items-center rounded-md ps-2 pe-3 text-xs leading-none transition-colors',
        className,
        isLiked
          ? 'bg-rose-50 text-rose-600 dark:bg-rose-100'
          : 'bg-neutral-50 hover:bg-rose-50 hover:text-rose-600 dark:bg-white/10 dark:hover:bg-white/10 dark:hover:text-rose-400'
      )}
      onClick={handleLike}
      title="좋아요" aria-label="좋아요" aria-pressed={isLiked}
    >
      <HeartIcon className="size-5" fill={isLiked ? 'currentColor' : 'none'} />

      <span className={clsx('ms-1', isLiked && 'text-rose-600')}>
        {convertNumbThousand(getDisplayLikeCount())}
      </span>
    </button>
  )
}

export default PostCardLikeBtn
