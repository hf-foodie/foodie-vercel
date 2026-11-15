'use client'
import { EmblaCarousel } from '@/components/EmblaCarousel'
import { TPost } from '@/data/types'
import { postImageUrl } from '@/lib/postImageUrl'
import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from '@headlessui/react'
import Image from 'next/image'
import { useState } from 'react'
export default function GalleryImages({
  images: initialImages,
  postId,
  previewUrls,
}: {
  images: string[]
  postId?: TPost['postId']
  previewUrls?: string[]
}) {
  const [open, setOpen] = useState(false)
  const [startIndex, setStartIndex] = useState(0)
  const images = previewUrls || initialImages.map((img) => postImageUrl(postId, img))
  if (!images.length) return <div className="kr-container kr-empty">등록된 사진이 없습니다.</div>
  return (
    <div className="kr-container kr-gallery">
      <div className={'kr-gallery-grid ' + (images.length === 1 ? 'single' : images.length === 2 ? 'pair' : '')}>
        {images.slice(0, 3).map((src, i) => (
          <button
            key={src + i}
            type="button"
            onClick={() => {
              setStartIndex(i)
              setOpen(true)
            }}
            aria-label={'사진 ' + (i + 1) + ' 확대, 전체 ' + images.length + '장'}
          >
            <Image
              src={src}
              fill
              alt={'식당 사진 ' + (i + 1)}
              sizes="(max-width:700px) 100vw, 50vw"
              className="object-cover"
            />
            {i === 0 && <span className="kr-gallery-count">사진 {images.length}장 · 확대</span>}
          </button>
        ))}
      </div>
      <Dialog open={open} onClose={() => setOpen(false)} className="relative z-50">
        <DialogBackdrop className="fixed inset-0 bg-black" />
        <div className="fixed inset-0 flex items-center justify-center">
          <DialogPanel className="relative aspect-[3/2] max-h-full w-full max-w-7xl">
            <DialogTitle className="sr-only">식당 사진 {images.length}장</DialogTitle>
            <button className="kr-button absolute top-3 right-3 z-50" onClick={() => setOpen(false)}>
              닫기
            </button>
            <EmblaCarousel images={images} option={{ startIndex, slidesToScroll: 1 }} />
          </DialogPanel>
        </div>
      </Dialog>
    </div>
  )
}
