'use client'
import { StatusMessage } from '@/components/krds/PageHeading'
import { ForumCategory, ForumPost } from '@/data/types'
import { clientFetch } from '@/lib/clientFetch'
import { communicationListHref, communicationQuery } from '@/lib/communicationNavigation'
import { saveCommunicationPosition, useCommunicationScroll } from '@/lib/communicationScroll'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
const categories: ForumCategory[] = ['공지사항', '자율소통', '맛집제보', '기능요청', '버그제보']
export default function CommunicationClient() {
  const params = useSearchParams(),
    router = useRouter()
  const mine = params.get('mine') === 'true',
    category = params.get('category') || '',
    query = params.get('q') || '',
    searchType = params.get('searchType') || 'title'
  const requested = Number(params.get('page') || 1),
    page = Number.isSafeInteger(requested) && requested > 0 ? requested : 1
  const [posts, setPosts] = useState<ForumPost[]>([]),
    [total, setTotal] = useState(0),
    [loading, setLoading] = useState(true),
    [error, setError] = useState(''),
    [unauthorized, setUnauthorized] = useState(false),
    [retry, setRetry] = useState(0)
  const listHref = communicationListHref(params)
  useCommunicationScroll(listHref, !loading && !error)
  const url = (changes: Record<string, string>) => {
    const p = new URLSearchParams(params.toString())
    for (const [k, v] of Object.entries(changes)) {
      if (v) p.set(k, v)
      else p.delete(k)
    }
    return '/communication?' + p
  }
  useEffect(() => {
    let active = true
    const controller = new AbortController()
    async function load() {
      setLoading(true)
      setError('')
      setUnauthorized(false)
      try {
        const p = new URLSearchParams({
          page: String(page - 1),
          size: '10',
          category,
          q: query,
          searchType,
          mine: String(mine),
        })
        const r = await clientFetch('/communications?' + p, { signal: controller.signal })
        if (!r.ok) {
          if (r.status === 401 && active) setUnauthorized(true)
          throw Error(
            r.status === 401
              ? '내 글을 찾으려면 로그인해 주세요.'
              : '게시글을 불러오지 못했습니다. 조건을 확인하고 다시 시도해 주세요.'
          )
        }
        const data = await r.json()
        if (active) {
          setPosts(data.content)
          setTotal(data.totalElements)
        }
      } catch (e) {
        if (active) {
          setPosts([])
          setTotal(0)
          setError(e instanceof Error ? e.message : '조회에 실패했습니다.')
        }
      } finally {
        if (active) setLoading(false)
      }
    }
    void load()
    return () => {
      active = false
      controller.abort()
    }
  }, [page, category, query, searchType, mine, retry])
  const pages = Math.max(1, Math.ceil(total / 10))
  const numbers = Array.from({ length: Math.min(5, pages) }, (_, i) => Math.max(1, Math.min(page - 2, pages - 4)) + i)
  return (
    <>
      <form action="/communication" className="kr-forum-toolbar" role="search">
        {mine && <input type="hidden" name="mine" value="true" />}
        <label>
          카테고리
          <select className="kr-input" name="category" defaultValue={category}>
            <option value="">전체</option>
            {categories.map((x) => (
              <option key={x}>{x}</option>
            ))}
          </select>
        </label>
        <label>
          검색 기준
          <select className="kr-input" name="searchType" defaultValue={searchType}>
            <option value="title">제목</option>
            <option value="author">작성자</option>
          </select>
        </label>
        <label className="kr-forum-query">
          전체 게시글 검색
          <input
            className="kr-input"
            type="search"
            name="q"
            defaultValue={query}
            maxLength={300}
            placeholder="검색어를 입력하세요"
          />
        </label>
        <button className="kr-button kr-button-primary" type="submit">
          검색
        </button>
        <Link className="kr-button" href="/communication/new">
          글쓰기
        </Link>
      </form>
      <div className="kr-actions my-5">
        <Link className="kr-link" href={url({ mine: mine ? '' : 'true', page: '1' })}>
          {mine ? '전체 글 보기' : '내 글 찾기'}
        </Link>
        <p className="kr-form-note">전체 게시글에서 검색하며, 내 글과 카테고리 조건을 함께 적용합니다.</p>
      </div>
      <p className="kr-search-summary">
        검색 결과 {total}건 · {page}/{pages}페이지 · 현재 표시 {loading || error ? 0 : posts.length}건
      </p>
      <StatusMessage error>
        {error ? (
          <>
            {error}
            {unauthorized && (
              <Link className="kr-link ml-2" href="/login">
                로그인
              </Link>
            )}
          </>
        ) : null}
      </StatusMessage>
      {error && (
        <button className="kr-button mb-4" onClick={() => setRetry((n) => n + 1)}>
          다시 시도
        </button>
      )}
      <section className="kr-forum-list" aria-label="게시글 목록">
        {loading ? (
          <p className="kr-empty" role="status">
            게시글을 불러오고 있습니다.
          </p>
        ) : error ? null : posts.length ? (
          posts.map((post) => (
            <article className="kr-forum-row" key={post.communicationId}>
              <div className="kr-forum-title">
                <span className="kr-badge">{post.category}</span>
                {post.isPinned && <span className="kr-badge">고정</span>}
                <h2>
                  <Link
                    id={'communication-post-' + post.communicationId}
                    href={'/communication/' + post.communicationId + communicationQuery(params)}
                    onClick={(event) => {
                      if (event.button === 0 && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey) {
                        saveCommunicationPosition(listHref, post.communicationId, event.currentTarget)
                      }
                    }}
                  >
                    {post.title}
                  </Link>
                </h2>
              </div>
              <div className="kr-forum-meta">
                <span>{post.writerNickname}</span>
                <span>댓글 {post.replyCount}</span>
                <span>조회 {post.viewCount}</span>
                <time dateTime={post.createdAt}>{new Date(post.createdAt).toLocaleDateString('ko-KR')}</time>
              </div>
            </article>
          ))
        ) : (
          <p className="kr-empty">
            {page > pages ? '요청한 페이지에 게시글이 없습니다.' : '조건에 맞는 게시글이 없습니다.'}
            {page > 1 && (
              <Link className="kr-link ml-2" href={url({ page: '1' })}>
                첫 페이지로
              </Link>
            )}
          </p>
        )}
      </section>
      {!loading && !error && pages > 1 && (
        <nav className="kr-forum-pagination" aria-label="게시글 페이지">
          <button
            className="kr-button"
            disabled={loading || page === 1}
            onClick={() => router.push(url({ page: String(page - 1) }))}
          >
            이전
          </button>
          {numbers.map((n) => (
            <button
              key={n}
              className={'kr-button ' + (page === n ? 'kr-button-primary' : '')}
              aria-current={page === n ? 'page' : undefined}
              onClick={() => router.push(url({ page: String(n) }))}
              disabled={loading}
            >
              {n}
            </button>
          ))}
          <button
            className="kr-button"
            disabled={loading || page >= pages}
            onClick={() => router.push(url({ page: String(page + 1) }))}
          >
            다음
          </button>
        </nav>
      )}
    </>
  )
}
