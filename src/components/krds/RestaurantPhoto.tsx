'use client'

import Image from 'next/image'
import { useState } from 'react'
import { restaurantPhotos, unverifiedRestaurantPhotos } from '@/data/restaurantPhotos'

type Props = { restaurantId?: number | null; title: string; fallbackSrc: string }

function PhotoImage({ src, alt }: { src: string; alt: string }) {
  const [failed, setFailed] = useState(false)
  return failed ? <PhotoPlaceholder /> : <Image src={src} alt={alt} fill sizes="(max-width:700px) 100vw, 240px" className="object-contain" onError={() => setFailed(true)} />
}

function PhotoPlaceholder({ pending = false }: { pending?: boolean }) {
  return <div className="flex h-full min-h-40 items-center justify-center bg-neutral-100 px-4 text-center text-neutral-600">{pending ? '사진 확인 중' : '등록된 사진이 없습니다'}</div>
}

export default function RestaurantPhoto({ restaurantId, title, fallbackSrc }: Props) {
  const photo = restaurantId ? restaurantPhotos[restaurantId] : undefined
  const pending = Boolean(restaurantId && unverifiedRestaurantPhotos[restaurantId])
  const src = photo?.src || fallbackSrc
  return <div className={'kr-recommend-image' + (pending || (photo && photo.square !== false) ? ' kr-recommend-image-square' : '')}>
    {pending ? <PhotoPlaceholder pending /> : <PhotoImage key={src} src={src} alt={photo?.alt || title + ' 사진'} />}
  </div>
}

export function RestaurantPhotoCredit({ restaurantId }: { restaurantId?: number | null }) {
  const photo = restaurantId ? restaurantPhotos[restaurantId] : undefined
  if (!photo) return null
  return <p className="text-xs text-neutral-500">사진: <span title={photo.sourceUrl}>{photo.sourceLabel || '다이닝코드 매장 안내'}</span></p>
}
