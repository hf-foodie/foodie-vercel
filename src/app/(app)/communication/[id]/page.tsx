'use client'
import ConfirmDialog from '@/components/krds/ConfirmDialog'
import { Breadcrumb, PageHeading, StatusMessage } from '@/components/krds/PageHeading'
import { ForumPost, TReply, TUserData } from '@/data/types'
import { clientFetch } from '@/lib/clientFetch'
import { communicationListHref } from '@/lib/communicationNavigation'
import Link from 'next/link'
import { useParams, useSearchParams } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
async function request(path: string, options?: RequestInit) {
  const r = await clientFetch(path, options)
  if (!r.ok) {
    const body = await r.json().catch(() => null)
    throw Error(body?.message || '요청을 처리하지 못했습니다. 다시 시도해 주세요.')
  }
  return r
}
export default function CommunicationDetail() {
  const { id } = useParams()
  const listHref = communicationListHref(useSearchParams())
  const base = '/communications/' + id
  const [post, setPost] = useState<ForumPost | null>(null),
    [replies, setReplies] = useState<TReply[]>([]),
    [user, setUser] = useState<TUserData | null>(null),
    [loading, setLoading] = useState(true),
    [error, setError] = useState(''),
    [notice, setNotice] = useState(''),
    [retry, setRetry] = useState(0),
    [comment, setComment] = useState(''),
    [busy, setBusy] = useState(false),
    [all, setAll] = useState(false),
    [deleting, setDeleting] = useState<number | null>(null)
  const inFlight = useRef(false)
  useEffect(() => {
    let active = true
    async function load() {
      setLoading(true)
      setError('')
      try {
        const [p, r, u] = await Promise.all([
          request(base).then((r) => r.json()),
          request(base + '/replies').then((r) => r.json()),
          clientFetch('/me')
            .then((r) => (r.ok ? r.json() : null))
            .catch(() => null),
        ])
        if (active) {
          setPost(p)
          setReplies(r)
          setUser(u)
        }
      } catch (e) {
        if (active) setError(e instanceof Error ? e.message : '조회 실패')
      } finally {
        if (active) setLoading(false)
      }
    }
    void load()
    return () => {
      active = false
    }
  }, [base, retry])
  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (inFlight.current || !comment.trim()) return
    inFlight.current = true
    setBusy(true)
    setError('')
    setNotice('')
    let saved = false
    try {
      await request(base + '/replies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: comment }),
      })
      saved = true
      setComment('')
      setReplies(await (await request(base + '/replies')).json())
      setNotice('댓글을 등록했습니다.')
    } catch (e) {
      setError(
        saved
          ? '댓글은 등록됐지만 목록을 갱신하지 못했습니다. 다시 조회해 주세요.'
          : e instanceof Error
            ? e.message
            : '댓글 등록 실패'
      )
    } finally {
      inFlight.current = false
      setBusy(false)
    }
  }
  async function remove() {
    if (deleting === null || inFlight.current) return
    inFlight.current = true
    setBusy(true)
    setError('')
    setNotice('')
    try {
      await request(base + '/replies/' + deleting, { method: 'DELETE' })
      setReplies((prev) => prev.filter((r) => r.replyId !== deleting))
      setNotice('댓글을 삭제했습니다.')
    } catch (e) {
      setError(e instanceof Error ? e.message : '댓글 삭제 실패')
    } finally {
      inFlight.current = false
      setBusy(false)
      setDeleting(null)
    }
  }
  return (
    <main className="kr-container kr-main kr-forum-detail">
      <Breadcrumb current="게시글 상세" parent={{ label: '소통 공간', href: listHref }} />
      {loading ? (
        <StatusMessage>게시글을 불러오고 있습니다.</StatusMessage>
      ) : (
        <>
          <StatusMessage error>{error}</StatusMessage>
          {error && (
            <button className="kr-button mb-4" disabled={busy} onClick={() => setRetry((n) => n + 1)}>
              다시 조회
            </button>
          )}
          <StatusMessage>{notice}</StatusMessage>
          {post && (
            <>
              <header>
                <div className="kr-actions mb-4">
                  <span className="kr-badge">{post.category}</span>
                  {post.isPinned && <span className="kr-badge">고정</span>}
                </div>
                <PageHeading title={post.title} />
                <div className="kr-forum-meta">
                  <span>{post.writerNickname}</span>
                  <time dateTime={post.createdAt}>{new Date(post.createdAt).toLocaleString('ko-KR')}</time>
                  <span>조회 {post.viewCount}</span>
                  <span>댓글 {replies.length}</span>
                </div>
              </header>
              <article className="kr-forum-content">{post.content || '내용이 없습니다.'}</article>
              <section className="kr-forum-replies">
                <h2>댓글 {replies.length}</h2>
                {user ? (
                  <form onSubmit={submit} className="kr-form-panel my-6">
                    <label htmlFor="forum-comment">댓글 내용</label>
                    <textarea
                      id="forum-comment"
                      className="kr-input mt-2"
                      required
                      rows={4}
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      disabled={busy}
                    />
                    <button className="kr-button kr-button-primary mt-4" disabled={busy || !comment.trim()}>
                      {busy ? '처리 중…' : '댓글 등록'}
                    </button>
                  </form>
                ) : (
                  <p className="kr-message">
                    <Link className="kr-link" href="/login">
                      로그인
                    </Link>{' '}
                    · 댓글 작성은 내부망에 정식 서비스 오픈 후 이용가능
                  </p>
                )}
                <div>
                  {(all ? replies : replies.slice(0, 4)).map((r) => (
                    <article className="kr-reply" key={r.replyId}>
                      <header>
                        <strong>{r.writerNickname}</strong>
                        <time dateTime={r.createdAt}>{new Date(r.createdAt).toLocaleString('ko-KR')}</time>
                        {(user?.id === r.writerId || ['ADMIN', 'MANAGER'].includes(user?.role || '')) && (
                          <button className="kr-button" disabled={busy} onClick={() => setDeleting(r.replyId)}>
                            삭제
                          </button>
                        )}
                      </header>
                      <p>{r.content}</p>
                    </article>
                  ))}
                </div>
                {replies.length > 4 && !all && (
                  <button className="kr-button mt-4" onClick={() => setAll(true)}>
                    전체보기 ({replies.length})
                  </button>
                )}
                {!replies.length && <p className="kr-empty">첫 댓글을 남겨주세요.</p>}
              </section>
            </>
          )}
        </>
      )}
      <Link className="kr-button mt-8" href={listHref}>
        목록으로
      </Link>
      <ConfirmDialog
        open={deleting !== null}
        title="댓글을 삭제할까요?"
        description="삭제한 댓글은 복구할 수 없습니다."
        confirmLabel="삭제"
        busy={busy}
        onClose={() => setDeleting(null)}
        onConfirm={() => void remove()}
      />
    </main>
  )
}
