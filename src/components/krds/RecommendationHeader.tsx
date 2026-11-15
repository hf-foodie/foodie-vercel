'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Breadcrumb, PageHeading } from './PageHeading'
const options = [
  ['ceo', '사장님의 선택', '전국 지사와 함께 찾은 추천 맛집입니다.'],
  ['vpresident', '부사장님의 선택', '추천 식당과 대표 메뉴를 확인해 보세요.'],
  ['cc', '사내커플 추천', '함께 즐기기 좋은 맛집을 소개합니다.'],
  ['intern', '인턴’s Pick', '인턴들이 추천하는 지역별 맛집을 만나보세요.'],
]
export default function RecommendationHeader() {
  const path = usePathname()
  const active = options.find(([id]) => path.endsWith('/' + id)) || options[3]
  return (
    <>
      <Breadcrumb current={active[1]} parent={{ label: '맛집 찾기', href: '/search' }} />
      <PageHeading title={active[1]} description={active[2]} />
      <nav className="kr-recommend-nav" aria-label="추천 모음">
        {options.map(([id, label]) => (
          <Link key={id} href={'/influencer/' + id} aria-current={path.endsWith('/' + id) ? 'page' : undefined}>
            {label}
          </Link>
        ))}
      </nav>
    </>
  )
}
