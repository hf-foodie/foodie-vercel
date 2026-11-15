'use client'
import React from 'react'
interface Props {
  imagePreviews: string[]
  mainImageIndex: number
  setMainImageIndex: (index: number) => void
  handleImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  handleRemoveImage: (index: number) => void
}
export default function ImageUploadArea({
  imagePreviews,
  mainImageIndex,
  setMainImageIndex,
  handleImageChange,
  handleRemoveImage,
}: Props) {
  return (
    <fieldset className="kr-upload">
      <legend>사진 등록 (선택)</legend>
      <p id="image-help" className="kr-form-note">
        최대 5장 · 장당 5MB · JPEG·PNG·WebP. 대표 사진을 선택할 수 있습니다.
      </p>
      <div className="kr-upload-grid">
        {imagePreviews.map((src, index) => (
          <div className="kr-upload-card" key={src}>
            <img src={src} alt={'등록할 사진 ' + (index + 1)} />
            <div>
              <button
                type="button"
                className={'kr-button ' + (mainImageIndex === index ? 'kr-button-primary' : '')}
                aria-pressed={mainImageIndex === index}
                onClick={() => setMainImageIndex(index)}
                aria-label={'사진 ' + (index + 1) + ' 대표 설정'}
              >
                {mainImageIndex === index ? '대표 사진' : '대표 설정'}
              </button>
              <button
                className="kr-button"
                type="button"
                onClick={() => handleRemoveImage(index)}
                aria-label={'사진 ' + (index + 1) + ' 삭제'}
              >
                삭제
              </button>
            </div>
          </div>
        ))}
      </div>
      {imagePreviews.length < 5 && (
        <label className="kr-file-input">
          사진 추가
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            aria-describedby="image-help"
            onChange={handleImageChange}
          />
        </label>
      )}
    </fieldset>
  )
}
