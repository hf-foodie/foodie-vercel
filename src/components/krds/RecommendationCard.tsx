'use client'
import { recordRestaurantOpen } from '@/lib/searchAnalytics'
import { restaurantReviewsHref } from '@/lib/restaurantNavigation'
import { saveBookmarkPosition } from '@/lib/bookmarkScroll'

import RestaurantPhoto, { RestaurantPhotoCredit } from './RestaurantPhoto'
import Link from 'next/link'
export default function RecommendationCard({
  title,
  previousName,
  address,
  image,
  menu,
  source,
  description,
  rating,
  className = '',
  restaurantId, cardId, listHref,
}: {
  title: string
  previousName?: string
  address: string
  image: string
  menu: string
  source?: string
  description?: string
  rating?: number
  className?: string
  restaurantId?: number | null
  cardId?: string
  listHref?: string
}) {
  return (
    <article id={cardId ? 'recommendation-card-' + cardId : undefined} data-restaurant-id={cardId} className={'kr-recommend-card ' + className}>
      <RestaurantPhoto restaurantId={restaurantId} title={title} fallbackSrc={image} />
      <div className="kr-recommend-body">
        {source && <span className="kr-badge">{source}</span>}
        <h2>{title}</h2>
        {previousName && <p className="kr-muted">이전 추천명: {previousName}</p>}
        {rating !== undefined && <p className="kr-link">★ 추천 점수 {rating.toFixed(1)}</p>}
        <p className="kr-muted">{address}</p>
        <RestaurantPhotoCredit restaurantId={restaurantId} />
        {description && <p>{description}</p>}
        <dl>
          <dt>대표 메뉴</dt>
          <dd>{menu || '등록된 메뉴가 없습니다.'}</dd>
        </dl>
        {listHref && !restaurantId ? <p className="kr-muted">등록 식당 연결 준비 중</p> : <Link className="kr-link" href={listHref && restaurantId ? restaurantReviewsHref(restaurantId,listHref) : '/restaurant/hf?q=' + encodeURIComponent(title)}
          onClick={e => {if(restaurantId && listHref)recordRestaurantOpen(restaurantId,listHref);const card=e.currentTarget.closest('article'); if(listHref && cardId && card)saveBookmarkPosition(listHref,cardId,card)}}>
          {listHref ? '맛집 후기 찾기 →' : '식당 목록에서 보기 →'}
        </Link>}
      </div>
    </article>
  )
}
