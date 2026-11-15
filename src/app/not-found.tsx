import { Breadcrumb, PageHeading } from '@/components/krds/PageHeading'
import Link from 'next/link'

export default function NotFound() {
  return (
    <main className="kr-container kr-main">
      <Breadcrumb current="페이지를 찾을 수 없습니다" />
      <section className="kr-panel">
        <span className="kr-badge">404</span>
        <PageHeading
          title="페이지를 찾을 수 없습니다"
          description="주소가 변경되었거나 더 이상 제공하지 않는 페이지입니다. 주소를 확인하거나 홈에서 다시 찾아주세요."
        />
        <div className="kr-actions">
          <Link className="kr-button kr-button-primary" href="/">
            홈으로
          </Link>
          <Link className="kr-button" href="/search">
            맛집 검색
          </Link>
        </div>
      </section>
    </main>
  )
}
