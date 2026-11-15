import { Suspense } from 'react'
import BookmarksClient from './BookmarksClient'
export const metadata = { title: '저장한 맛집' }
export default function Page() { return <Suspense fallback={<p className="kr-container kr-main">저장한 맛집을 불러오고 있습니다.</p>}><BookmarksClient /></Suspense> }
