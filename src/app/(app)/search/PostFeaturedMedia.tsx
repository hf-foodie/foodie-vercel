import { postImageUrl } from '@/lib/postImageUrl'

import GallerySlider from '@/app/(app)/search/GallerySlider'
import { TPostSummary } from '@/data/types'
import clsx from 'clsx'
import { FC } from 'react'

interface Props {
  detailHref?: string
  className?: string
  post: TPostSummary
  isHover?: boolean
}

const PostFeaturedMedia: FC<Props> = ({ className, detailHref, post, isHover = false }) => {
  const handle = String(post.postId)

  const imageUrls = post.imageFileNames.map((fileName) => postImageUrl(post.postId, fileName))

  const renderPostGallery = () => {
    return <GallerySlider detailHref={detailHref} handle={handle} galleryImgs={imageUrls} />
  }

  return <div className={clsx('relative size-full overflow-hidden', className)}>{renderPostGallery()}</div>
}

export default PostFeaturedMedia
