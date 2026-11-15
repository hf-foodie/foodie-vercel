'use client'
import { Breadcrumb, PageHeading, StatusMessage } from '@/components/krds/PageHeading'
import { TPost } from '@/data/types'
import GalleryImages from '../../posts/GalleryImages'
export default function PostPreview({
  post,
  previewUrls,
  onFinalSubmit,
  onBack,
  isSubmitting,
  error,
}: {
  post: TPost
  previewUrls: string[]
  onFinalSubmit: () => void
  onBack: () => void
  isSubmitting: boolean
  error?: string
}) {
  return (
    <main className="kr-container kr-main kr-post-preview">
      <Breadcrumb current="맛집 미리보기" />
      <PageHeading title="맛집 미리보기" description="아직 게시되지 않았습니다. 내용을 확인한 뒤 최종 제출해 주세요." />
      <StatusMessage error>{error}</StatusMessage>
      <div className="kr-actions mb-6">
        <button className="kr-button" disabled={isSubmitting} onClick={onBack}>
          수정하기
        </button>
        <button className="kr-button kr-button-primary" disabled={isSubmitting} onClick={onFinalSubmit}>
          {isSubmitting ? '제출 중…' : '최종 제출하기'}
        </button>
      </div>
      <article className="kr-form-panel">
        <span className="kr-badge">미리보기</span>
        <h2 className="mt-4">{post.title}</h2>
        <p className="mt-3">
          {post.restaurantName} · ★ {post.rating.toFixed(1)}
        </p>
        <GalleryImages images={[]} previewUrls={previewUrls} />
        <div className="kr-preview-content">
          <h3>후기</h3>
          <p className="whitespace-pre-wrap">{post.summary}</p>
          {post.oneLineReviews.length > 0 && (
            <>
              <h3>한 줄 평</h3>
              <ul>
                {post.oneLineReviews.map((review) => (
                  <li key={review}>{review}</li>
                ))}
              </ul>
            </>
          )}
          <h3>식당 정보</h3>
          <p>{post.address}</p>
          <p>{post.phoneNumber || '등록된 전화번호가 없습니다.'}</p>
          {post.tags.length > 0 && (
            <div className="kr-actions">
              {post.tags.map((tag) => (
                <span className="kr-badge" key={tag}>
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </article>
    </main>
  )
}
