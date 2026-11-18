 'use client'
import BookmarkBtn from '@/components/BookmarkBtn'
import { restaurantReviewsHref } from '@/lib/restaurantNavigation'
import { saveBookmarkPosition as saveRestaurantPosition } from '@/lib/bookmarkScroll'
import { TRestaurant } from '@/data/types'
import { MemberLink as Link } from '@/components/MemberAccess'
import RestaurantPhoto, { RestaurantPhotoCredit } from '@/components/krds/RestaurantPhoto'
export default function RestaurantCard({ data, className = '', listHref }: { data: TRestaurant; className?: string; listHref?: string }) {
  return (
    <article id={'restaurant-card-' + data.restaurantId} data-restaurant-id={data.restaurantId} className={'kr-recommend-card ' + className}>
      <RestaurantPhoto restaurantId={data.restaurantId} title={data.name} fallbackSrc={'/images/restaurant/thumbnail/' + data.restaurantId + '.jpg'} />
      <div className="kr-recommend-body">
        <span className="kr-badge">{data.category || '식당'}</span>
        <div className="flex items-center justify-between gap-3"><h2>{data.name}</h2><BookmarkBtn restaurantId={data.restaurantId} /></div>
        <p className="kr-muted">{data.address}</p>
        <dl>
          <dt>대표 메뉴</dt>
          <dd>{data.representativeMenuNames?.join(', ') || '등록된 메뉴가 없습니다.'}</dd>
        </dl>
        <RestaurantPhotoCredit restaurantId={data.restaurantId} />
        <Link className="kr-link" href={listHref ? restaurantReviewsHref(data.restaurantId, listHref) : '/blogs?restaurantId=' + data.restaurantId}
          onClick={event => { const card = event.currentTarget.closest('article'); if (listHref && card) saveRestaurantPosition(listHref, data.restaurantId, card) }}>
          맛집 후기 찾기 →
        </Link>
      </div>
    </article>
  )
}
