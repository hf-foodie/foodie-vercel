import Link from 'next/link'
export default function Footer() {
  return (
    <footer className="kr-footer">
      <div className="kr-container">
        <div className="kr-footer-brand">
          오늘뭐먹지 <span>함께 찾고, 함께 나누는 주금공 임직원이 추천한 맛집</span>
        </div>
        <nav aria-label="하단 메뉴">
          <Link href="/about">서비스 소개</Link>
          <Link href="/communication">의견·문의</Link>
          <Link href="/restaurant-proposals">식당 정보 수정 제안</Link>
        </nav>
        <small>© 오늘뭐먹지</small>
      </div>
    </footer>
  )
}
