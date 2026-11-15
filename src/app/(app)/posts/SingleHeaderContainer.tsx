import GalleryImages from '@/app/(app)/posts/GalleryImages'
import { Breadcrumb } from '@/components/krds/PageHeading'
import { restaurantListLabel, restaurantReturnHref } from '@/lib/restaurantNavigation'
import { TPost } from '@/data/types'
import { Divider } from '@/shared/divider'
import { StarIcon } from '@heroicons/react/24/solid'
import clsx from 'clsx'
import { FC } from 'react'
import SingleMeta from './SingleMeta'
import { SingleMetaAction } from './SingleMetaAction'
import SingleTitle from './SingleTitle'

interface Props {
  listHref?: string
  className?: string
  post: TPost
  comments: TPost['comments']
  previewUrls?: string[]
}

const TitleAndMeta = ({ className, post, comments }: Omit<Props, 'headerStyle' | 'previewUrls'>) => {
  const { postId, updatedAt, rating, authorNickname, restaurantName, title, viewCount, likeCount, liked, bookmarked } =
    post

  const fixedRating = rating.toFixed(1)

  return (
    <div className={`single-header-meta space-y-5 ${className}`}>
      <SingleTitle title={title} />
      <p className="kr-detail-name">
        <span>{restaurantName}</span>
        <span className="kr-detail-rating">
          <StarIcon className={clsx('text-orange-400', 'size-5')} />
          <span>{fixedRating}</span>
        </span>
      </p>
      <Divider />
      <div className="flex flex-wrap gap-5">
        <SingleMeta authorNickname={authorNickname} updatedAt={updatedAt} viewCount={viewCount} />
        <SingleMetaAction
          className="ms-auto"
          commentCount={comments.length}
          handle={postId}
          likeCount={likeCount}
          liked={liked}
          bookmarked={bookmarked}
        />
      </div>
    </div>
  )
}

const HeaderGallery = ({
  className,
  post,
  comments,
  previewUrls,
  listHref = '/search',
}: Omit<Props, 'defaultStyle'>) => {
  return (
    <>
      <div className={clsx('kr-detail-header', className)}>
        <div className="kr-container">
          <Breadcrumb current="맛집 상세" parent={{ label: listHref.startsWith('/bookmarks') ? '저장한 맛집' : restaurantReturnHref(listHref) ? restaurantListLabel(listHref) : '맛집 찾기', href: listHref }} />
          <div className="w-full">
            <TitleAndMeta post={post} comments={comments} />
          </div>
        </div>
        <GalleryImages images={post.imageFileNames} postId={post.postId} previewUrls={previewUrls} />
      </div>
    </>
  )
}

const SingleHeaderContainer: FC<Props> = ({ className, post, comments, previewUrls, listHref }) => {
  return (
    <HeaderGallery
      listHref={listHref}
      className={className}
      post={post}
      comments={comments}
      previewUrls={previewUrls}
    />
  )
}

export default SingleHeaderContainer
