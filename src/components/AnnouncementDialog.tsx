'use client'
import { useEffect, useMemo, useState } from 'react'
import { Button as SharedButton } from '@/shared/Button'
import { Dialog, DialogActions, DialogBody, DialogTitle } from '@/shared/dialog'
import { Divider } from '@/shared/divider'
import { useRouter } from 'next/navigation'

// Keys
const SESSION_KEY = 'announcement:dismissed'
const DATE_KEY = 'announcement:lastDismissedDate'

function getTodayStr() {
  // 날짜가 바뀌면 다시 띄우기 위해 로컬 캘린더 기준 YYYY-MM-DD 문자열 사용
  const d = new Date()
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

export default function AnnouncementDialog() {
  const [open, setOpen] = useState(false)
  const today = useMemo(() => getTodayStr(), [])
  const router = useRouter()

  useEffect(() => {
    // 노출 조건:
    // - 같은 탭/세션에서 이미 닫았으면(sessionStorage) 오늘은 다시 열지 않음
    // - 단, 날짜가 바뀌면(localStorage의 저장된 날짜 !== today) 다시 열기
    try {
      const sessionDismissed = typeof window !== 'undefined' && sessionStorage.getItem(SESSION_KEY) === '1'
      const lastDismissedDate = typeof window !== 'undefined' ? localStorage.getItem(DATE_KEY) : null

      const suppressedForToday = sessionDismissed && lastDismissedDate === today
      setOpen(!suppressedForToday)
    } catch {
      setOpen(true)
    }
  }, [today])

  const handleClose = () => {
    try {
      sessionStorage.setItem(SESSION_KEY, '1')
      localStorage.setItem(DATE_KEY, today)
    } catch {}
    setOpen(false)
  }

  const goToAbout = () => {
    router.push('/about')
  }

  return (
    <Dialog className="mt-4" size="4xl" open={open} onClose={handleClose}>
      <DialogTitle>공지사항</DialogTitle>
      <DialogBody>
          <div className="flex flex-col gap-5 text-sm/6">
              <div className="flex flex-wrap gap-2.5">
                  <div className="text-neutral-600 dark:text-neutral-400">제목:</div>
                  <div className="font-medium text-2xl">
                      {'"오늘뭐먹지" 업데이트 현황'}
                  </div>
              </div>
              <Divider />

              <div className="flex flex-wrap gap-2.5">
                  <div className="text-neutral-600 dark:text-neutral-400">내용:</div>
                  <div className="text-lg">
                      <p>
                          로그인 없이 이용가능!!<br/>
                          (댓글, 게시판 등 로그인 필요)<br/><br/>
                          1. 맛집 등록을 원하시는 분은 &quot;소통공간 &gt; 맛집신문고&quot;에 제보해주세요<br/>
                          2. 3월~4월 중 새로운 맛집 및 경동파크타워 인근 맛집 등록 예정.<br/>
                          3. 어붐랴.<br/>
                      </p>
                  </div>
              </div>
              <Divider />

              <div className="flex flex-wrap gap-2.5">
                  <div className="text-neutral-600 dark:text-neutral-400">담당자:</div>
                  <div className="text-lg">
                      <p>
                          ICT운영부 문성욱 (2007)
                      </p>
                  </div>
              </div>
          </div>
      </DialogBody>
      <DialogActions>
          <SharedButton plain onClick={goToAbout}>
              오늘뭐먹지
          </SharedButton>
          <SharedButton onClick={handleClose}>
            확인
          </SharedButton>
      </DialogActions>
    </Dialog>
  )
}
