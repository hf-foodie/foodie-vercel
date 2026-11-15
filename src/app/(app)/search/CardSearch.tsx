'use client'
import BookmarkBtn from '@/components/BookmarkBtn'
import PostCardCommentBtn from '@/components/PostCardCommentBtn'
import PostCardLikeBtn from '@/components/PostCardLikeBtn'
import { TPostSummary } from '@/data/types'
import { saveSearchPosition } from '@/lib/searchScroll'
import Link from 'next/link'
import { useState } from 'react'
import PostCardMeta from './PostCardMeta'
import PostFeaturedMedia from './PostFeaturedMedia'
export default function CardSearch({
  post,
  listHref,
  detailHref = '/posts/' + post.postId,
  className = '',
  hiddenAuthor = false,
  ratio = 'aspect-4/3',
}: {
  listHref?: string
  detailHref?: string
  post: TPostSummary
  className?: string
  hiddenAuthor?: boolean
  ratio?: string
}) {
  const [isHover, setIsHover] = useState(false)
  return (
    <article
      id={listHref ? 'search-post-' + post.postId : undefined}
      onClickCapture={(event) => {
        const anchor = (event.target as HTMLElement).closest('a')
        if (
          listHref &&
          anchor &&
          new URL(anchor.href).pathname === '/posts/' + post.postId &&
          event.button === 0 &&
          !event.metaKey &&
          !event.ctrlKey &&
          !event.shiftKey &&
          !event.altKey
        ) {
          saveSearchPosition(listHref, Number(post.postId), event.currentTarget)
        }
      }}
      className={'kr-food-card group ' + className}
      onMouseEnter={() => setIsHover(true)}
      onMouseLeave={() => setIsHover(false)}
    >
      <div className={'kr-food-card-media relative ' + ratio}>
        <PostFeaturedMedia detailHref={detailHref} post={post} isHover={isHover} />
      </div>
      <div className="kr-food-card-content">
        <div className="kr-actions" style={{ justifyContent: 'space-between' }}>
          <Link className="kr-badge" href={'/restaurant/hf?q=' + encodeURIComponent(post.restaurantName)}>
            {post.restaurantName}
          </Link>
          <span aria-label={'별점 ' + post.rating}>★ {post.rating.toFixed(1)}</span>
        </div>
        <h3>
          <Link href={detailHref}>{post.title}</Link>
        </h3>
        <p className="kr-food-address">{post.address}</p>
        {!hiddenAuthor && <PostCardMeta post={post} />}
        <div className="kr-food-card-footer">
          <BookmarkBtn restaurantId={post.restaurantId} bookmarked={post.bookmarked} />
          <PostCardLikeBtn likeCount={post.likeCount} liked={post.liked} postId={post.postId} />
          <PostCardCommentBtn href={detailHref + '#comments'} commentCount={post.commentCount} postId={post.postId} />
        </div>
      </div>
    </article>
  )
}
