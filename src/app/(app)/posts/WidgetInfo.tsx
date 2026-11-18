import { MemberLink as Link } from '@/components/MemberAccess'
export default function WidgetInfo({
  name,
  address,
  phoneNumber,
  className = '',
}: {
  name: string
  address: string
  phoneNumber: string
  className?: string
}) {
  return (
    <section className={'kr-info ' + className}>
      <h2>식당 정보</h2>
      <dl>
        <dt>식당명</dt>
        <dd>{name}</dd>
        <dt>주소</dt>
        <dd>{address}</dd>
        <dt>전화번호</dt>
        <dd>
          {phoneNumber ? (
            <a className="kr-link" href={'tel:' + phoneNumber.replace(/[^+0-9]/g, '')}>
              {phoneNumber}
            </a>
          ) : (
            '등록된 번호가 없습니다.'
          )}
        </dd>
      </dl>
      <Link className="kr-button" href={'/restaurant/hf?q=' + encodeURIComponent(name)}>
        식당 목록에서 보기
      </Link>
      <Link className="kr-link mt-4 block text-center" href="/restaurant-proposals">
        식당 정보 수정 제안
      </Link>
    </section>
  )
}
