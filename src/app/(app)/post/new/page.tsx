'use client'

import { Breadcrumb, PageHeading, StatusMessage } from '@/components/krds/PageHeading'
import ButtonPrimary from '@/shared/ButtonPrimary'
import Input from '@/shared/Input'
import { TagsInput } from '@/shared/TagsInput'
import Textarea from '@/shared/Textarea'
import PostPreview from './PostPreview'
import ImageUploadArea from './components/ImageUploadArea'
import RatingSelector from './components/RatingSelector'
import RestaurantSelect from './components/RestaurantSelect'
import { usePostForm } from './hooks/usePostForm'

const PostNewPage = () => {
  const {
    error,
    title,
    setTitle,
    oneLineReviews,
    setOneLineReviews,
    summary,
    setSummary,
    rating,
    setRating,
    address,
    phoneNumber,
    selectedRestaurant,
    query,
    setQuery,
    tags,
    setTags,
    imagePreviews,
    mainImageIndex,
    setMainImageIndex,
    isSubmitting,
    isPreviewMode,
    setIsPreviewMode,
    previewPost,
    filteredRestaurants,
    handleSelectRestaurant,
    handleImageChange,
    handleRemoveImage,
    handleSubmit,
    handleFinalSubmit,
  } = usePostForm()

  if (isPreviewMode && previewPost) {
    return (
      <PostPreview
        error={error}
        post={previewPost}
        previewUrls={
          imagePreviews.length
            ? [imagePreviews[mainImageIndex], ...imagePreviews.filter((_, i) => i !== mainImageIndex)]
            : []
        }
        onFinalSubmit={handleFinalSubmit}
        onBack={() => setIsPreviewMode(false)}
        isSubmitting={isSubmitting}
      />
    )
  }

  return (
    <>
      <main className="kr-container kr-main kr-post-form">
        <div className="mx-auto max-w-4xl">
          <Breadcrumb current="맛집 등록" />
          <PageHeading title="맛집 등록" description="식당을 선택하고 후기를 작성한 뒤, 미리보기에서 확인해 주세요." />
          <p className="kr-form-note">제목·내용은 필수입니다. 사진·태그·한 줄 평은 선택 항목입니다.</p>
          <StatusMessage error>{error}</StatusMessage>

          <form onSubmit={handleSubmit} className="kr-form-panel mt-6 grid grid-cols-1 gap-6">
            {/* 식당 선택 */}
            <RestaurantSelect
              selectedRestaurant={selectedRestaurant}
              setSelectedRestaurant={handleSelectRestaurant}
              query={query}
              setQuery={setQuery}
              filteredRestaurants={filteredRestaurants}
            />

            {/* 제목 */}
            <label className="block">
              <span className="font-medium text-neutral-800 dark:text-neutral-200">제목</span>
              <Input
                className="mt-1"
                placeholder="포스트 제목을 입력하세요"
                value={title}
                maxLength={200}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </label>

            {/* 한 줄 평 */}
            <div className="block">
              <span className="font-medium text-neutral-800 dark:text-neutral-200">한 줄 평 (최대 10개)</span>
              <div className="mt-1 rounded-md border border-neutral-200 bg-white p-3 dark:border-neutral-700 dark:bg-neutral-900">
                <TagsInput
                  value={oneLineReviews}
                  onChange={setOneLineReviews}
                  placeholder="한 줄 평을 입력하고 엔터를 누르세요"
                  label="한 줄 평"
                  maxTags={10}
                  vertical={true}
                />
              </div>
            </div>

            {/* 요약/내용 */}
            <label className="block">
              <span className="font-medium text-neutral-800 dark:text-neutral-200">내용</span>
              <Textarea
                className="mt-1"
                rows={6}
                placeholder="식당에 대한 후기를 작성해주세요"
                value={summary}
                maxLength={10000}
                onChange={(e) => setSummary(e.target.value)}
                required
              />
            </label>

            {/* 별점 */}
            <RatingSelector rating={rating} setRating={setRating} />

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {/* 주소 */}
              <label className="block">
                <span className="font-medium text-neutral-800 dark:text-neutral-200">주소</span>
                <Input className="mt-1" placeholder="식당 주소" value={address} readOnly />
              </label>

              {/* 전화번호 */}
              <label className="block">
                <span className="font-medium text-neutral-800 dark:text-neutral-200">전화번호</span>
                <Input className="mt-1" placeholder="02-1234-5678" value={phoneNumber} readOnly />
              </label>
            </div>

            {/* 태그 */}
            <div className="block">
              <span className="font-medium text-neutral-800 dark:text-neutral-200">태그</span>
              <div className="mt-1 rounded-md border border-neutral-200 bg-white p-3 dark:border-neutral-700 dark:bg-neutral-900">
                <TagsInput
                  label="태그"
                  value={tags}
                  maxTags={10}
                  onChange={setTags}
                  placeholder="태그를 입력하고 엔터를 누르세요"
                />
              </div>
            </div>

            {/* 이미지 업로드 */}
            <ImageUploadArea
              imagePreviews={imagePreviews}
              mainImageIndex={mainImageIndex}
              setMainImageIndex={setMainImageIndex}
              handleImageChange={handleImageChange}
              handleRemoveImage={handleRemoveImage}
            />

            <div className="pt-4">
              <ButtonPrimary type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? '등록 중...' : '미리보기로 확인'}
              </ButtonPrimary>
            </div>
          </form>
        </div>
      </main>
    </>
  )
}

export default PostNewPage
