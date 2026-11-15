'use client'

import { FC, useState, useEffect } from 'react'
import Image from 'next/image'
import { useSwipeable } from 'react-swipeable'
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline'

const images = [
  '/images/advertisement/main_01.png',
  '/images/advertisement/main_02.png',
  '/images/advertisement/main_04.png',
]

const SectionAdvertisement: FC = () => {
  const [indexActive, setIndexActive] = useState(0)
  const [isHovered, setIsHovered] = useState(false)
  const [isFocused, setIsFocused] = useState(false)
  const handleClickNext = () => setIndexActive((index) => (index + 1) % images.length)
  const handleClickPrev = () => setIndexActive((index) => (index + images.length - 1) % images.length)

  useEffect(() => {
    if (isHovered || isFocused) return
    const interval = setInterval(() => setIndexActive((index) => (index + 1) % images.length), 4000)
    return () => clearInterval(interval)
  }, [isHovered, isFocused])

  const handlers = useSwipeable({ onSwipedLeft: handleClickNext, onSwipedRight: handleClickPrev })

  return (
    <section
      aria-label="오늘의 메뉴 배너"
      className="kr-advertisement overflow-hidden rounded-2xl bg-black text-white"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onFocusCapture={() => setIsFocused(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setIsFocused(false)
      }}
    >
      <div className="grid items-center md:grid-cols-[2fr_3fr]">
        <div className="px-6 py-6 md:px-8 md:py-10 lg:px-10">
          <h2 className="text-2xl font-bold leading-tight lg:text-4xl">&quot;오늘 뭐 먹지?&quot;</h2>
          <p className="mt-3 text-base text-neutral-300 lg:text-lg">오늘의 메뉴를 정해보세요</p>
        </div>
        <div className="kr-advertisement-image relative aspect-[880/489] w-full min-w-0" {...handlers}>
          <Image
            fill
            className="object-contain"
            src={images[indexActive]}
            sizes="(max-width: 767px) 100vw, (max-width: 1280px) 60vw, 720px"
            alt={`오늘의 메뉴 안내 배너 ${indexActive + 1}`}
          />
        </div>
      </div>
      <div className="flex min-h-14 items-center justify-center gap-3 border-t border-white/15 px-4 py-1">
        <button type="button" onClick={handleClickPrev} aria-label="이전 배너" className="flex h-11 w-11 items-center justify-center rounded-full hover:bg-white/15 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white">
          <ChevronLeftIcon className="h-5 w-5" aria-hidden="true" />
        </button>
        {images.map((src, index) => (
          <button key={src} type="button" onClick={() => setIndexActive(index)} aria-label={`${index + 1}번 배너 보기`} aria-pressed={indexActive === index} className="flex h-11 w-8 items-center justify-center rounded focus-visible:outline-2 focus-visible:outline-white">
            <span aria-hidden="true" className={`h-2 rounded-full ${indexActive === index ? 'w-6 bg-white' : 'w-2 bg-white/40'}`} />
          </button>
        ))}
        <button type="button" onClick={handleClickNext} aria-label="다음 배너" className="flex h-11 w-11 items-center justify-center rounded-full hover:bg-white/15 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white">
          <ChevronRightIcon className="h-5 w-5" aria-hidden="true" />
        </button>
      </div>
    </section>
  )
}

export default SectionAdvertisement
