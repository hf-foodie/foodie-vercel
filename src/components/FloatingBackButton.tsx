'use client'

import { ArrowLeftIcon } from '@heroicons/react/24/solid'
import { useRouter } from 'next/navigation'
import { restaurantListLabel, restaurantReturnHref } from '@/lib/restaurantNavigation'

const FloatingBackButton = ({ href = '/search' }: { href?: string }) => {
  const router = useRouter()
  const label = href.startsWith('/bookmarks') ? '저장한 맛집으로 돌아가기' : restaurantReturnHref(href) ? restaurantListLabel(href) + ' 목록으로 돌아가기' : '검색 결과로 돌아가기'

  return (
    <button
      onClick={() => router.push(href)}
      className="fixed right-10 bottom-10 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-slate-900 text-white shadow-xl transition-transform hover:scale-110 focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 focus:outline-none dark:bg-slate-800"
      aria-label={label}
      title={label}
    >
      <ArrowLeftIcon className="h-6 w-6" />
    </button>
  )
}

export default FloatingBackButton
