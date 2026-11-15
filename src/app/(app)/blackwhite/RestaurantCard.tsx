'use client'
import { recordRestaurantOpen } from '@/lib/searchAnalytics'
import Link from 'next/link'
import { restaurantReviewsHref } from '@/lib/restaurantNavigation'
import { saveBookmarkPosition } from '@/lib/bookmarkScroll'

import { TBlackWhite } from '@/data/types'
import RestaurantPhoto, { RestaurantPhotoCredit } from '@/components/krds/RestaurantPhoto'
import { curatedRestaurantDisplay } from '@/lib/curatedRestaurant'
export default function RestaurantCard({ data, className = '', listHref }: { data: TBlackWhite; className?: string; listHref: string }) {
  const display = curatedRestaurantDisplay(data.restaurantName, data.address, data.linkedRestaurant)
  return (
    <article id={'blackwhite-card-'+data.bwId} data-restaurant-id={data.bwId} className={'kr-recommend-card ' + className}>
      <RestaurantPhoto restaurantId={data.restaurantId} title={display.name} fallbackSrc={'/images/blackwhite/thumbnail/' + data.bwId + '.jpg'} />
      <div className="kr-recommend-body">
        <span className="kr-badge">
          시즌 {data.season} · {data.spoonClass}
        </span>
        <h2>{display.name}</h2>
        {display.previousName && <p className="kr-muted">이전 추천명: {display.previousName}</p>}
        <p>
          {data.chefName}
          {data.nickname && ' · ' + data.nickname}
        </p>
        <p className="kr-muted">{display.address}</p>
        <RestaurantPhotoCredit restaurantId={data.restaurantId} />
        {data.signatureMenus?.length > 0 && (
          <dl>
            <dt>대표 메뉴</dt>
            <dd>{data.signatureMenus.join(', ')}</dd>
          </dl>
        )}
        {data.restaurantId ? <Link className="kr-link" href={restaurantReviewsHref(data.restaurantId,listHref)} onClick={e=>{if(data.restaurantId)recordRestaurantOpen(data.restaurantId,listHref);const card=e.currentTarget.closest('article');if(card)saveBookmarkPosition(listHref,data.bwId,card)}}>맛집 후기 찾기 →</Link> : <p className="kr-muted">등록 식당 연결 준비 중</p>}
      </div>
    </article>
  )
}
