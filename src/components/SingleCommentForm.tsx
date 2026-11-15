import { Button } from '@/shared/Button'
import ButtonPrimary from '@/shared/ButtonPrimary'
import Textarea from '@/shared/Textarea'
import React, { FC } from 'react'

interface Props extends React.HTMLAttributes<HTMLFormElement> {
  className?: string
  onClickSubmit?: (content: string) => void
  onClickCancel?: () => void
  textareaRef?: React.RefObject<HTMLTextAreaElement | null>
  defaultValue?: string
  rows?: number
}

const SingleCommentForm: FC<Props> = ({
  className = 'mt-5',
  onClickSubmit,
  onClickCancel,
  textareaRef,
  defaultValue = '',
  rows = 4,
  ...props
}) => {
  const localTextareaRef = React.useRef<HTMLTextAreaElement>(null)
  const finalRef = textareaRef || localTextareaRef

  const handleCancel = () => {
    if (finalRef.current) {
      finalRef.current.value = ''
    }
    if (onClickCancel) {
      onClickCancel()
    }
  }

  return (
    <form
      className={`single-comment-form ${className}`}
      onSubmit={(e) => {
        e.preventDefault()
        const content = finalRef.current?.value || ''
        if (onClickSubmit) {
          onClickSubmit(content)
        }
        if (finalRef.current) {
          finalRef.current.value = ''
        }
      }}
      {...(props as any)}
    >
      <Textarea
        placeholder="맛집에 대한 의견을 남겨주세요" aria-label="댓글 내용"
        ref={finalRef}
        required={true}
        defaultValue={defaultValue}
        rows={rows}
      />
      <div className="mt-3 flex gap-3">
        <Button plain type="button" onClick={handleCancel}>
          취소
        </Button>
        <ButtonPrimary type="submit">작성</ButtonPrimary>
      </div>
    </form>
  )
}

export default SingleCommentForm
