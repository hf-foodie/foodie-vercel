import clsx from 'clsx'
import Image from 'next/image'
import Link from 'next/link'
import { FC } from 'react'
import MagazineBadgeList from "@/components/SectionMagazine/Badge/MagazineBadgeList";
import MagazineCardMeta from "@/components/SectionMagazine/Card/MagazineCardMeta";
import {TMagazine} from "@/data/types";
import PostCardLikeBtn from "@/components/PostCardLikeBtn";
import PostCardCommentBtn from "@/components/PostCardCommentBtn";
import PostCardBookmarkBtn from "@/components/PostCardBookmarkBtn";

interface Props {
  className?: string
  magazine: TMagazine
  color: string
}

const CardSub: FC<Props> = ({ className, magazine, color }) => {
  const {
    title,
    magazineId,
    postId,
    restaurantName,
    nickname,
    updated_at,
    likeCount,
    liked,
    viewCount,
    bookmarked,
    commentCount
  } = magazine

  const imageUrl = `/images/magazines/${magazineId}/main.jpg`

  return (
    <div
      className={clsx(
        'group post-card-6 relative flex flex-wrap gap-5 rounded-3xl border border-neutral-200 bg-white p-4 sm:flex-nowrap dark:border-neutral-700 dark:bg-neutral-900',
        className
      )}
    >
      <div className="flex grow flex-col gap-y-2.5">
        <div className="space-y-3">
          <MagazineBadgeList name={restaurantName} color={color} />
          <h2 className="post-card-title block max-w-sm text-sm font-semibold sm:text-base">
            <Link href={`/posts/${postId}`} className="line-clamp-1" title={title}>
              {title}
            </Link>
          </h2>
          <MagazineCardMeta nickname={nickname} updated_at={updated_at} />
        </div>
        <div className="relative mt-auto flex flex-wrap gap-x-2 gap-y-1">
          <PostCardLikeBtn likeCount={likeCount} liked={liked} postId={magazine.postId} />
          <PostCardCommentBtn commentCount={commentCount} postId={postId} />
          <PostCardBookmarkBtn className="ms-auto" viewCount={viewCount} bookmarked={bookmarked} postId={magazine.postId} />
        </div>
      </div>

      <Link href={`/posts/${postId}`} className="relative block size-40 shrink-0">
        <Image
          sizes="(max-width: 600px) 50vw, 33vw"
          className="size-full rounded-2xl object-cover brightness-100 transition-[filter] duration-300 group-hover:brightness-75"
          fill
          src={imageUrl}
          alt={title}
        />
      </Link>
    </div>
  )
}

export default CardSub
