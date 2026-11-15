'use client'

import { Description, Dialog, DialogBackdrop, DialogPanel, DialogTitle, Switch } from '@headlessui/react'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { isNoticeHidden, NOTICE_DAY, NOTICE_KEY, NOTICE_SESSION_KEY } from '@/lib/site-notice'
import styles from './SiteNotice.module.css'

export default function SiteNotice() {
  const [open, setOpen] = useState(false)
  const [hideDay, setHideDay] = useState(false)
  const [message, setMessage] = useState('')
  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      let hidden = false, dismissed = false
      try { hidden = isNoticeHidden(localStorage.getItem(NOTICE_KEY), Date.now()) } catch { /* Storage may be blocked. */ }
      try { dismissed = sessionStorage.getItem(NOTICE_SESSION_KEY) === 'yes' } catch { /* Show once for this page lifecycle. */ }
      setOpen(!hidden && !dismissed)
    })
    return () => cancelAnimationFrame(frame)
  }, [])
  function toggle(value: boolean) {
    try {
      if (value) localStorage.setItem(NOTICE_KEY, String(Date.now() + NOTICE_DAY))
      else localStorage.removeItem(NOTICE_KEY)
      setHideDay(value)
      setMessage(value ? '이 브라우저에서 지금부터 24시간 동안 공지를 표시하지 않습니다.' : '')
    } catch {
      setMessage('브라우저 저장이 제한되어 하루 동안 숨기기를 적용하지 못했습니다. 공지는 닫을 수 있습니다.')
    }
  }
  function close() {
    try {
      if (hideDay) sessionStorage.removeItem(NOTICE_SESSION_KEY)
      else sessionStorage.setItem(NOTICE_SESSION_KEY, 'yes')
    } catch { /* Closing must work even when browser storage is unavailable. */ }
    setOpen(false)
  }
  return <Dialog open={open} onClose={close} className="kr-dialog">
    <DialogBackdrop className="kr-dialog-backdrop" />
    <div className="kr-dialog-position">
      <DialogPanel className={`kr-dialog-panel ${styles.panel}`}>
        <div className={styles.heading}><span className={styles.badge}>서비스 개편 안내</span><button type="button" className="kr-button" onClick={close} aria-label="공지 닫기" data-autofocus>닫기 ×</button></div>
        <DialogTitle as="h2">오늘뭐먹지가 새로워졌어요</DialogTitle>
        <Description>더 편하게 찾고, 함께 정확한 맛집 정보를 나눠보세요.</Description>
        <ul className={styles.changes}>
          <li><strong>닉네임 기반의 블라인드 서비스</strong><p>우리 서비스는 블라인드 기반으로 운영합니다. ※ 회원가입 시 사용한 닉네임 기반으로 운영</p></li>
          <li><strong>KRDS 디자인 스타일로 개편</strong><p>PC와 모바일에서 일관되고 읽기 쉬운 화면으로 바뀌었습니다.</p></li>
          <li><strong>회원의 맛집 등록·수정 참여 기능 추가</strong><p>로그인 후 맛집과 후기를 등록하고, 달라진 식당 정보는 수정 제안으로 알려주세요. 회원의 제안은 매니저·관리자가 검토하며, 매니저·관리자는 직접 수정할 수 있습니다.</p></li>
        </ul>
        <nav className={styles.links} aria-label="처음 이용하는 분을 위한 안내">
          <Link href="/about" onClick={close}><strong>오늘뭐먹지 소개 →</strong><span>서비스와 운영진을 알아보세요.</span></Link>
          <Link href="/help" onClick={close}><strong>시작하기 →</strong><span>사용 방법과 매니저 참여 안내</span></Link>
          <Link href="/technology" onClick={close}><strong>기술과 운영 →</strong><span>기술 스택·아키텍처·SBOM 확인</span></Link>
        </nav>
        <div className={styles.footer}>
          <Switch checked={hideDay} onChange={toggle} className={styles.toggle} aria-label="하루 동안 더 이상 보지 않기"><span className={styles.track} aria-hidden="true"><span /></span><span>하루 동안 더 이상 보지 않기</span></Switch>
          <button type="button" className="kr-button kr-button-primary" onClick={close}>확인하고 시작하기</button>
        </div>
        <p role="status" className={styles.status}>{message}</p>
      </DialogPanel>
    </div>
  </Dialog>
}
