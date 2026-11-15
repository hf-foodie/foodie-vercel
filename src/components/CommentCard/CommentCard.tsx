'use client'

import { Button } from '@/shared/Button'
import Textarea from '@/shared/Textarea'
import { Dialog, DialogActions, DialogBody, DialogTitle } from '@/shared/dialog'
import { Dropdown, DropdownButton, DropdownItem, DropdownMenu } from '@/shared/dropdown'
import {
  ArrowTurnBackwardIcon,
  Delete03Icon,
  MoreHorizontalIcon,
  UserIcon,
} from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import clsx from 'clsx'
import Link from 'next/link'
import { FC, useRef, useState } from 'react'
import SingleCommentForm from '../SingleCommentForm'
import CommentLikeBtn from './CommentLikeBtn'
import CommentReplyBtn from './CommentReplyBtn'
import { TComment, TUserData } from '@/data/types'

interface Props {
  className?: string
  comment: TComment
  isReply?: boolean
  onDelete?: (commentId: TComment['commentId']) => void
  onReply?: (content: string) => void
  currentUser?: TUserData | null
}

const CommentCard: FC<Props> = ({ className, comment, isReply, onDelete, onReply, currentUser }) => {
  const { commentId, authorId, authorNickname, content, createdAt } = comment

  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [isReplying, setIsReplying] = useState(false)
  const [isEditting, setIsEditting] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isOpenDialogReportComment, setIsOpenDialogReportComment] = useState(false)

  const isAuthor = currentUser?.id === authorId

  const openReplyForm = () => {
    setIsReplying(true)
    setTimeout(() => {
      textareaRef.current && (textareaRef.current as HTMLTextAreaElement).focus()
    }, 20)
  }
  const closeReplyForm = () => {
    setIsReplying(false)
  }

  const openModalEditComment = () => setIsEditting(true)
  const closeModalEditComment = () => setIsEditting(false)

  const openModalDeleteComment = () => setIsDeleting(true)
  const closeModalDeleteComment = () => setIsDeleting(false)

  const commentActions = [
    {
      name: '답글 작성',
      icon: ArrowTurnBackwardIcon,
      onClick: () => {
        openReplyForm()
      },
    },
  ]

  if (isAuthor) {
    commentActions.push({
      name: '댓글 삭제',
      icon: Delete03Icon,
      onClick: () => {
        openModalDeleteComment()
      },
    })
  }

  const handleDelete = () => {
    if (onDelete) {
      onDelete(commentId)
    }
    closeModalDeleteComment()
  }

  return (
    <>
      <div className={clsx(`comment-card flex relative ${className}`, isReply && 'ms-8 sm:ms-12')}>
        {isReply && (
          <div className="absolute -start-4 sm:start-[-1.5rem] top-0 bottom-[calc(100%-1.1rem)] w-4 border-b-2 border-neutral-200 dark:border-neutral-700 rounded-bl-xl pointer-events-none" />
        )}
        <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-neutral-100 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400">
          <HugeiconsIcon icon={UserIcon} size={20} />
        </div>
        <div className="ms-2 flex grow flex-col rounded-xl border border-neutral-200 p-4 text-sm sm:ms-3 sm:text-base dark:border-neutral-700">
          <div className="relative flex items-center pe-6">
            <div className="absolute -end-3 -top-3">
              <Dropdown>
                <DropdownButton
                  as="button"
                  className="flex size-8.5 items-center justify-center rounded-lg bg-neutral-100 transition-colors duration-300 hover:bg-neutral-200 dark:bg-white/10 dark:hover:bg-white/20"
                >
                  <HugeiconsIcon icon={MoreHorizontalIcon} size={20} />
                </DropdownButton>
                <DropdownMenu>
                  {commentActions.map((item, index) => (
                    <DropdownItem key={index} onClick={item.onClick}>
                      <HugeiconsIcon icon={item.icon} size={20} data-slot="icon" />
                      {item.name}
                    </DropdownItem>
                  ))}
                </DropdownMenu>
              </Dropdown>
            </div>
            <Link
              className="shrink-0 font-semibold text-neutral-800 dark:text-neutral-100"
              href={`/blogs?c=author&s=${encodeURIComponent(authorNickname)}`}
            >
              {authorNickname}
            </Link>
            <span className="mx-2">·</span>
            <span className="line-clamp-1 text-xs text-neutral-600 sm:text-sm dark:text-neutral-400">
              <time dateTime={createdAt}>
                {new Date(createdAt).toLocaleDateString('ko-KR', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </time>
            </span>
          </div>

          <p className="mt-2 mb-3 text-base/relaxed text-neutral-700 sm:mt-3 sm:mb-4 dark:text-neutral-300">
            {content}
          </p>

          {isReplying ? (
            <SingleCommentForm
              textareaRef={textareaRef}
              onClickSubmit={(replyContent) => {
                if (onReply) {
                  onReply(replyContent)
                }
                closeReplyForm()
              }}
              onClickCancel={closeReplyForm}
              className="grow"
            />
          ) : (
            <div className="flex items-center gap-2">
              <CommentReplyBtn onClick={openReplyForm} />
            </div>
          )}
        </div>
      </div>

      {/* DIALOG DELETE COMMENT */}
      <Dialog open={isDeleting} onClose={closeModalDeleteComment}>
        <DialogTitle>Delete comment?</DialogTitle>
        <DialogBody>
          <p>댓글을 삭제하시겠습니가?</p>
        </DialogBody>
        <DialogActions>
          <Button plain onClick={closeModalDeleteComment}>
            Cancel
          </Button>
          <Button onClick={handleDelete}>삭제</Button>
        </DialogActions>
      </Dialog>

      {/* DIALOG EDIT COMMENT */}
      <Dialog size="3xl" open={isEditting} onClose={closeModalEditComment}>
        <DialogTitle>Edit comment</DialogTitle>
        <DialogBody>
          <Textarea
            autoFocus
            data-autofocus
            placeholder="Add to discussion"
            ref={textareaRef}
            required={true}
            defaultValue={content}
            rows={8}
          />
        </DialogBody>
        <DialogActions>
          <Button plain onClick={closeModalEditComment}>
            Cancel
          </Button>
          <Button onClick={closeModalEditComment}>Save</Button>
        </DialogActions>
      </Dialog>

      {/* DIALOG REPORT COMMENT */}
      <Dialog open={isOpenDialogReportComment} onClose={() => setIsOpenDialogReportComment(false)}>
        <DialogTitle>Report this comment?</DialogTitle>
        <DialogBody>
          <p>Are you sure you want to report this comment? This action will report this comment.</p>
        </DialogBody>
        <DialogActions>
          <Button plain onClick={() => setIsOpenDialogReportComment(false)}>
            Cancel
          </Button>
          <Button onClick={() => setIsOpenDialogReportComment(false)}>Report</Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

export default CommentCard
