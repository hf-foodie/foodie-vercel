'use client'

import clsx from 'clsx'
import { FC, useState } from 'react'
import NcImage from '../NcImage/NcImage'
import { TTouristAttraction } from '@/data/tourist-attraction'
import CategoryMagazineTouristAttractionBadgeList
    from "@/components/SectionMagazineTour/CategoryMagazineTouristAttractionBadgeList";
import {Dialog, DialogActions, DialogBody, DialogTitle} from "@/shared/dialog";
import { Button } from "@/shared/Button";
import { EmblaCarousel } from "@/components/EmblaCarousel";
import PostCardMeta from "@/components/SectionMagazineTour/PostCardMeta";

interface Props {
  className?: string
  touristAttraction: TTouristAttraction
}

const CardMagazineTour: FC<Props> = ({ className, touristAttraction}) => {
  const { title, name, excerpt, categories, galleryImgs, author, date } = touristAttraction
  const [isHover, setIsHover] = useState(false)
  const [isOpen, setIsOpen] = useState(false)

  const openModal = () => setIsOpen(true)
  const closeModal = () => setIsOpen(false)

  return (
    <div
      className={clsx('group post-card-10-v3 relative flex flex-col', className)}
      onMouseEnter={() => setIsHover(true)}
      onMouseLeave={() => setIsHover(false)}
    >
      <div
          className="relative aspect-square w-full overflow-hidden rounded-3xl sm:aspect-16/9 cursor-pointer"
          onClick={openModal}
      >
        <div className="grid size-full grid-cols-3 gap-2">
          <div className="grid">
            <NcImage alt="gallery 1" fill src={galleryImgs[0]} />
          </div>
          <div className="grid grid-rows-2 gap-2">
            <NcImage alt="gallery 2" fill src={galleryImgs[1]} />
            <NcImage alt="gallery 3" fill src={galleryImgs[2]} />
          </div>
          <div className="grid">
            <NcImage alt="gallery 4" fill src={galleryImgs[3]} />
          </div>
        </div>

        <div className="absolute inset-0 bg-neutral-900/20 opacity-0 transition-opacity group-hover:opacity-100" />
      </div>

      <div className="absolute inset-x-3 top-3 flex items-start justify-between space-x-4">
        <CategoryMagazineTouristAttractionBadgeList categories={categories} />
        {/*<PostCardSaveBtn bookmarked={bookmarked} />*/}
      </div>

      <div className="mt-4 space-y-4 px-4">
        <h2 className="block font-semibold text-neutral-900 sm:text-lg dark:text-neutral-100">
          <button className="text-left" onClick={openModal} title={title}>
            {title}
          </button>
        </h2>
        <PostCardMeta author={author} date={date} />
      </div>

      <Dialog open={isOpen} onClose={closeModal} size="3xl">
        <DialogTitle>
          <div className="flex flex-col gap-2">
            <span>{name} / {title}</span>
            <span className="text-base font-normal text-neutral-500 dark:text-neutral-400">
              {excerpt}
            </span>
          </div>
        </DialogTitle>
        <DialogBody>
          <div className="max-w-3xl mx-auto">
            <EmblaCarousel images={galleryImgs} />
          </div>
        </DialogBody>
        <DialogActions>
          <Button onClick={closeModal}>닫기</Button>
        </DialogActions>
      </Dialog>
    </div>
  )
}

export default CardMagazineTour
