import '@/styles/tailwind.css'
import '@/styles/krds.css'
import { Metadata } from 'next'
import ThemeProvider from './theme-provider'
import { getAllRestaurantList } from '@/services/restaurant'
import SiteNotice from '@/components/krds/SiteNotice'


export const metadata: Metadata = {
  title: {
    template: '%s - 오늘뭐먹지',
    default: '오늘뭐먹지',
  },
  description: '함께 찾고, 함께 나누는 주금공 임직원이 추천한 맛집',
  keywords: ['오늘뭐먹지', '주금공', '임직원 추천 맛집'],
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const initialRestaurants = await getAllRestaurantList().catch(() => [])

  return (
    <html lang="ko">
      <body className="bg-white text-base text-neutral-900 dark:bg-neutral-900 dark:text-neutral-200">
        <ThemeProvider initialRestaurants={initialRestaurants}>
          <div className="border-b border-amber-300 bg-amber-50 px-4 py-3 text-center text-sm text-neutral-900">
            외부 테스트 환경입니다. 실제 개인정보·업무 자료를 입력하지 마세요. 기술과 운영 페이지의 사내망 검증 기록은 이 외부 환경의 보안 검증 결과가 아닙니다.
          </div>
          <div>{children}</div>
          <SiteNotice />
        </ThemeProvider>
      </body>
    </html>
  )
}

export const dynamic = 'force-dynamic'
