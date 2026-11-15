'use client'

import { Breadcrumb, PageHeading, StatusMessage } from '@/components/krds/PageHeading'
import { ForumCategory, TUserData } from '@/data/types'
import { clientFetch } from '@/lib/clientFetch'
import Input from '@/shared/Input'
import Textarea from '@/shared/Textarea'
import { useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'

const CATEGORIES: ForumCategory[] = ['공지사항', '자율소통', '맛집제보', '기능요청', '버그제보']

const PostCreatePage = () => {
  const router = useRouter()
  const [message, setMessage] = useState('')
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState<ForumCategory>('자율소통')
  const [content, setContent] = useState('')
  const [isPinned, setIsPinned] = useState(false)
  const [userData, setUserData] = useState<TUserData | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || ''
        const response = await clientFetch(`${baseUrl}/me`)

        if (response.ok) {
          const data = await response.json()
          setUserData(data)
          // 공지사항 권한이 있는 경우 초기값을 공지사항으로 설정할지 여부는 선택사항이나,
          // 안전하게 자율소통을 기본값으로 유지하거나 권한에 따라 변경할 수 있음
          if (data.role === 'ADMIN' || data.role === 'MANAGER') {
            setCategory('공지사항')
          }
        }
      } catch (error) {
        console.error('Failed to fetch user data:', error)
      }
    }

    fetchUserData()
  }, [])

  const canPin = userData?.role === 'ADMIN' || userData?.role === 'MANAGER'
  const availableCategories = canPin ? CATEGORIES : CATEGORIES.filter((cat) => cat !== '공지사항')

  const handleCategoryChange = (val: ForumCategory) => {
    setCategory(val)
    if (val === '공지사항') {
      setIsPinned(true)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (loading) return
    setMessage('')
    // 최종 제출 시 공지사항이면 무조건 isPinned true 보장
    const finalIsPinned = category === '공지사항' ? true : isPinned

    setLoading(true)
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || ''
      const response = await clientFetch(`${baseUrl}/communications`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          category,
          content,
          isPinned: finalIsPinned,
        }),
      })

      if (response.ok) {
        router.push('/communication')
      } else if (response.status === 401) {
        // clientFetch에서 이미 처리하지만 추가적인 UI 대응이 필요하다면 여기서 수행
        setMessage('로그인이 필요합니다. 로그인 후 다시 시도해 주세요.')
      } else {
        const errorData = await response.json()
        setMessage(`게시글 작성에 실패했습니다: ${errorData.message || response.statusText}`)
      }
    } catch (error) {
      console.error('Failed to submit post:', error)
      setMessage('오류가 발생했습니다. 입력 내용을 확인하고 다시 시도해 주세요.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="kr-container kr-main kr-forum-new">
      <div className="mx-auto max-w-3xl">
        <Breadcrumb current="글쓰기" parent={{ label: '소통 공간', href: '/communication' }} />
        <PageHeading title="글쓰기" description="분류를 선택하고 의견을 작성해 주세요. 제목과 내용은 필수입니다." />
        <StatusMessage error>{message}</StatusMessage>

        <form onSubmit={handleSubmit} className="kr-form-panel grid grid-cols-1 gap-6">
          {/* 카테고리 및 옵션 */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-neutral-800 dark:text-neutral-200">카테고리</label>
              <select
                aria-label="카테고리"
                className="kr-input mt-1"
                value={category}
                onChange={(e) => handleCategoryChange(e.target.value as ForumCategory)}
                required
              >
                {availableCategories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {canPin && category !== '공지사항' && (
              <div className="flex items-end pb-2">
                <label className="flex cursor-pointer items-center select-none">
                  <input
                    type="checkbox"
                    className="text-primary-6000 h-5 w-5 rounded border-neutral-300 focus:ring-primary-500"
                    checked={isPinned}
                    onChange={(e) => setIsPinned(e.target.checked)}
                  />
                  <span className="ml-2 text-sm font-medium text-neutral-800 dark:text-neutral-200">
                    게시글 상단 고정
                  </span>
                </label>
              </div>
            )}
            {category === '공지사항' && (
              <p className="kr-form-note self-end pb-2">공지사항은 목록 상단에 고정됩니다.</p>
            )}
          </div>

          {/* 제목 입력 */}
          <div>
            <label className="block text-sm font-medium text-neutral-800 dark:text-neutral-200">제목</label>
            <Input
              type="text"
              aria-label="제목"
              maxLength={300}
              placeholder="제목을 입력해주세요"
              className="mt-1"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          {/* 내용 입력 */}
          <div>
            <label className="block text-sm font-medium text-neutral-800 dark:text-neutral-200">내용</label>
            <Textarea
              aria-label="내용"
              className="mt-1"
              rows={12}
              placeholder="내용을 입력해주세요"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
            />
          </div>

          {/* 버튼 영역 */}
          <div className="kr-actions mt-4 justify-end">
            <button className="kr-button" type="button" onClick={() => router.back()}>
              취소
            </button>
            <button className="kr-button kr-button-primary" type="submit" disabled={loading}>
              {loading ? '등록 중…' : '등록하기'}
            </button>
          </div>
        </form>
      </div>
    </main>
  )
}
export default PostCreatePage
