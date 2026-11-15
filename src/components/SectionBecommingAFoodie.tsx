'use client'

import rightImgDemo from '@/images/BecomeAnAuthorImg.png'
import ButtonPrimary from '@/shared/ButtonPrimary'
import clsx from 'clsx'
import Image, { StaticImageData } from 'next/image'
import { FC } from 'react'

interface Props {
  className?: string
  rightImg?: string | StaticImageData
}

const SectionBecommingAFoodie: FC<Props> = ({ className, rightImg = rightImgDemo }) => {
  return (
    <>
      <div className={clsx('section-become-an-author relative flex flex-col items-center lg:flex-row', className)}>
        <div className="mb-14 shrink-0 lg:mr-10 lg:mb-0 lg:w-2/5">
          <span className="text-base font-medium tracking-wider text-neutral-500 uppercase">
            나만이 아는 맛집을 추천해주세요!!
          </span>
          <h2 className="mt-3 text-3xl font-semibold sm:text-4xl">HF 맛플루언서를 모집합니다</h2>
          <span className="mt-8 block text-neutral-500 dark:text-neutral-500">
            &ldquo;오늘뭐먹지&rdquo; 맛집(데이터) 관리자에 지원해주세요, 서로 맛집을 공유하며 소통하는 분위기를 만드는데 도움주실분을 기다립니다
          </span>
          <ButtonPrimary className="mt-8" href="/communication">
            맛집 제보하기
          </ButtonPrimary>
        </div>
        <div className="grow">
          <Image alt="hero" sizes="(max-width: 768px) 100vw, 50vw" src={rightImg} />
        </div>
      </div>
    </>
  )
}

export default SectionBecommingAFoodie
