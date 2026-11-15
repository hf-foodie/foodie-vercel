'use client'

import clsx from 'clsx'
import useEmblaCarousel from 'embla-carousel-react'
import { ThemeContext } from '@/app/theme-provider'
import { EmblaOptionsType } from 'embla-carousel'
import Image from 'next/image'
import { FC, useCallback, useContext, useEffect, useState } from 'react'
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline'

interface EmblaCarouselProps {
  images: string[]
  option?: EmblaOptionsType
}

export const EmblaCarousel: FC<EmblaCarouselProps> = ({ images, option }) => {
  const theme = useContext(ThemeContext)

  const [selectedIndex, setSelectedIndex] = useState(0)
  const [prevBtnEnabled, setPrevBtnEnabled] = useState(false)
  const [nextBtnEnabled, setNextBtnEnabled] = useState(false)

  const [emblaMainRef, emblaMainApi] = useEmblaCarousel({
    ...option,
    direction: theme?.themeDir,
  })
  const [emblaThumbsRef, emblaThumbsApi] = useEmblaCarousel({
    ...option,
    containScroll: 'keepSnaps',
    dragFree: true,
    direction: theme?.themeDir,
  })

  const scrollPrev = useCallback(() => emblaMainApi && emblaMainApi.scrollPrev(), [emblaMainApi])
  const scrollNext = useCallback(() => emblaMainApi && emblaMainApi.scrollNext(), [emblaMainApi])

  const onThumbClick = useCallback(
    (index: number) => {
      if (!emblaMainApi || !emblaThumbsApi) return
      emblaMainApi.scrollTo(index)
    },
    [emblaMainApi, emblaThumbsApi]
  )

  const onSelect = useCallback(() => {
    if (!emblaMainApi || !emblaThumbsApi) return
    setSelectedIndex(emblaMainApi.selectedScrollSnap())
    emblaThumbsApi.scrollTo(emblaMainApi.selectedScrollSnap())
    setPrevBtnEnabled(emblaMainApi.canScrollPrev())
    setNextBtnEnabled(emblaMainApi.canScrollNext())
  }, [emblaMainApi, emblaThumbsApi, setSelectedIndex])

  useEffect(() => {
    if (!emblaMainApi) return
    onSelect()

    emblaMainApi.on('select', onSelect).on('reInit', onSelect)
  }, [emblaMainApi, onSelect])

  return (
    <div className="relative size-full embla">
      <div className="embla__viewport relative mx-auto size-full overflow-hidden" ref={emblaMainRef}>
        <div className="embla__container size-full flex">
          {images.map((image, index) => (
            <div className="relative z-50 flex embla__slide basis-full shrink-0 items-center justify-center" key={index}>
              <div className="relative w-full aspect-[3/2]">
                <Image
                  alt="Slide image"
                  src={image}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 80vw"
                  className="object-contain"
                  loading="lazy"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Buttons - Positioned top right near the close button */}
      {images.length > 1 && (
        <div className="absolute top-2.5 right-14 z-[60] flex gap-2 sm:top-4 sm:right-16">
          <button
            className="flex items-center justify-center w-10 h-10 rounded-full bg-neutral-900/80 hover:bg-black text-white shadow-lg transition-all disabled:opacity-0 disabled:pointer-events-none"
            onClick={scrollPrev}
            disabled={!prevBtnEnabled}
            aria-label="Previous slide"
          >
            <ChevronLeftIcon className="w-6 h-6 stroke-[2.5px]" />
          </button>
          <button
            className="flex items-center justify-center w-10 h-10 rounded-full bg-neutral-900/80 hover:bg-black text-white shadow-lg transition-all disabled:opacity-0 disabled:pointer-events-none"
            onClick={scrollNext}
            disabled={!nextBtnEnabled}
            aria-label="Next slide"
          >
            <ChevronRightIcon className="w-6 h-6 stroke-[2.5px]" />
          </button>
        </div>
      )}

      <div className="embla-thumbs mt-4">
        <div className="embla-thumbs__viewport mx-auto max-w-full overflow-hidden" ref={emblaThumbsRef}>
          <div className="embla-thumbs__container flex gap-2">
            {images.map((image, index) => (
              <div
                key={index}
                className={clsx(
                  'relative flex aspect-5/3 w-20 shrink-0 cursor-pointer items-center justify-center transition-[transform,filter] duration-300 ease-in-out',
                  index === selectedIndex
                    ? 'z-10 scale-110 overflow-hidden rounded-md brightness-100 ring-2 ring-primary-500'
                    : 'brightness-50 hover:brightness-75'
                )}
                onClick={() => onThumbClick(index)}
              >
                <Image alt="Thumb image" src={image} fill sizes="100px" className={'object-cover rounded-md'} loading="lazy" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
