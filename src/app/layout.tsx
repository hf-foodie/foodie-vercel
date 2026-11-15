import '@/styles/tailwind.css'
import '@/styles/krds.css'
import { Metadata } from 'next'
import ThemeProvider from './theme-provider'
import { getAllRestaurantList } from '@/services/restaurant'
import SiteNotice from '@/components/krds/SiteNotice'
import PreviewWebAnalytics from '@/components/PreviewWebAnalytics'
import { isAnalyticsEnabled } from '@/lib/webAnalytics'


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
            인터넷 체험 버전 · 등록된 자료를 조회할 수 있습니다. 회원가입·댓글 등은 내부망에 정식 서비스 오픈 후 이용가능. 기술과 운영의 사내망 검증 기록은 이 체험 환경의 검증 결과가 아닙니다.
          </div>
          <div>{children}</div>
          <SiteNotice />
        </ThemeProvider>
        {isAnalyticsEnabled(process.env.VERCEL_ENV) && <PreviewWebAnalytics />}
      </body>
    </html>
  )
}

export const dynamic = 'force-dynamic'
