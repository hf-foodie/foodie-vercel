'use client'

import CommentCard from '@/components/CommentCard/CommentCard'
import PostCardCommentBtn from '@/components/PostCardCommentBtn'
import PostCardLikeBtn from '@/components/PostCardLikeBtn'
import SingleCommentForm from '@/components/SingleCommentForm'
import useIntersectionObserver from '@/hooks/useIntersectionObserver'
import ButtonPrimary from '@/shared/ButtonPrimary'
import Tag from '@/shared/Tag'
import { Link } from '@/shared/link'
import { ArrowUp02Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { FC, useEffect, useRef, useState } from 'react'
import TheContent from './TheContent'
import {TComment, TPost, TUserData} from "@/data/types";
import clsx from "clsx";
import {clientFetch} from "@/lib/clientFetch";
import { addComment, deleteComment, getCurrentUser } from "@/services/comment";

interface Props {
  post: TPost
  comments: TPost['comments']
  className?: string
}

const SingleContentContainer: FC<Props> = ({ post, comments: initialComments, className }) => {
    const endedAnchorRef = useRef<HTMLDivElement>(null)
    const contentRef = useRef<HTMLDivElement>(null)
    const progressRef = useRef<HTMLButtonElement>(null)
    const [isShowScrollToTop, setIsShowScrollToTop] = useState<boolean>(false)
    const [comments, setComments] = useState<TComment[]>(initialComments)
    const [currentUser, setCurrentUser] = useState<TUserData | null>(null)
    const [showAllComments, setShowAllComments] = useState(false)

    const baseUrl = process.env.NEXT_PUBLIC_API_URL || ''

    useEffect(() => {
        {
            getCurrentUser()
                .then(data => data && setCurrentUser(data))
                .catch(err => console.error('Failed to fetch user data:', err))
        }
    }, [])

    const handleAddComment = async (content: string, parentCommentId: string | null = null) => {
        if (!content.trim() || postId === 'preview') return

        try {
            const res = await addComment(postId, content, parentCommentId)

            if (res.ok) {
                window.location.reload()
            } else {
                const error = await res.json()
                alert(error.message || '댓글 작성에 실패했습니다.')
            }
        } catch (err) {
            console.error('Failed to submit comment:', err)
            alert('오류가 발생했습니다.')
        }
    }

    const handleDeleteComment = async (commentId: string) => {
        try {
            const res = await deleteComment(postId, commentId)

            if (res.ok) {
                window.location.reload()
            } else {
                alert('댓글 삭제에 실패했습니다.')
            }
        } catch (err) {
            console.error('Failed to delete comment:', err)
            alert('오류가 발생했습니다.')
        }
    }

    const {
        postId,
        updatedAt,
        badges,
        rating,
        authorNickname,
        restaurantName,
        title,
        summary,
        oneLineReviews,
        address,
        phoneNumber,
        tags,
        imageFileNames,
    } = post

    const endedAnchorEntry = useIntersectionObserver(endedAnchorRef, {
        threshold: 0,
        root: null,
        rootMargin: '0%',
        freezeOnceVisible: false,
    })

    useEffect(() => {
      const handleProgressIndicator = () => {
        const entryContent = contentRef.current
        const progressBarContent = progressRef.current

        if (!entryContent || !progressBarContent) {
          return
        }

        const winScroll = window.scrollY || document.documentElement.scrollTop
        const entryContentRect = entryContent.getBoundingClientRect()
        const entryContentTop = entryContentRect.top
        const entryContentHeight = entryContentRect.height

        const totalEntryH = entryContentTop + window.scrollY + entryContentHeight
        const scrolled = (winScroll / totalEntryH) * 100

        progressBarContent.innerText = scrolled.toFixed(0) + '%'

        if (scrolled >= 100) {
          setIsShowScrollToTop(true)
        } else {
          setIsShowScrollToTop(false)
        }
      }

      const handleProgressIndicatorHeadeEvent = () => {
        window?.requestAnimationFrame(handleProgressIndicator)
      }
      handleProgressIndicator()
      window?.addEventListener('scroll', handleProgressIndicatorHeadeEvent)
      return () => {
        window?.removeEventListener('scroll', handleProgressIndicatorHeadeEvent)
      }
    }, [])

    const showLikeAndCommentSticky = endedAnchorEntry && !endedAnchorEntry.isIntersecting && endedAnchorEntry.boundingClientRect.top > 0

    const rootComments = comments.filter((comment) => !comment.parentCommentId)

    const getDisplayData = () => {
        if (showAllComments) {
            return rootComments.map(root => ({
                root,
                replies: comments.filter(r => r.parentCommentId === root.commentId)
            }));
        }

        const result: { root: TComment; replies: TComment[] }[] = [];
        let totalCount = 0;
        const limit = 4;

        for (const root of rootComments) {
            if (totalCount >= limit) break;

            const rootItem = { root, replies: [] as TComment[] };
            totalCount++;

            const replies = comments.filter(r => r.parentCommentId === root.commentId);
            for (const reply of replies) {
                if (totalCount >= limit) break;
                rootItem.replies.push(reply);
                totalCount++;
            }
            result.push(rootItem);
        }
        return result;
    }

    const displayData = getDisplayData();

  return (
    <div className={`relative ${className}`}>
      <div className="single-content space-y-10">
        <div
          id="single-entry-content"
          className="mx-auto prose max-w-(--breakpoint-md)! lg:prose-lg dark:prose-invert"
          ref={contentRef}
        >
          <TheContent summary={summary} reviews={oneLineReviews} />
        </div>

        {/* COMMENT FORM */}
        <div id="comments" className="mx-auto max-w-(--breakpoint-md) scroll-mt-20 pt-5">
          <h3 className="text-xl font-semibold text-neutral-800 dark:text-neutral-200">댓글 ({comments.length})</h3>
          <SingleCommentForm onClickSubmit={(content) => handleAddComment(content)} />
        </div>

        {/* COMMENTS LIST */}
        <div className="mx-auto max-w-(--breakpoint-md)">
          <ul className="single-comment-lists space-y-6">
            {displayData
              .map(({root: comment, replies}) => (
                <li key={comment.commentId} className="space-y-4">
                  <CommentCard
                    comment={comment}
                    currentUser={currentUser}
                    onDelete={handleDeleteComment}
                    onReply={(content) => handleAddComment(content, comment.commentId)}
                  />
                  {replies
                    .map((reply, index, array) => (
                      <div key={reply.commentId} className="relative">
                        {/* Vertical line connecting from parent to the last reply */}
                        <div
                          className={clsx(
                            'absolute start-4 sm:start-6 border-s-2 border-neutral-200 dark:border-neutral-700',
                            index === 0 ? 'top-[-1.5rem] h-[calc(100%+1.5rem)]' : 'top-0 h-full',
                            index === array.length - 1 && 'h-[1.1rem]',
                          )}
                        />
                        <CommentCard
                          comment={reply}
                          isReply
                          currentUser={currentUser}
                          onDelete={handleDeleteComment}
                          onReply={(content) => handleAddComment(content, comment.commentId)}
                        />
                      </div>
                    ))}
                </li>
              ))}
            {comments.length > 4 && !showAllComments && (
              <ButtonPrimary
                className="mt-10 w-full"
                onClick={() => setShowAllComments(true)}
              >
                전체보기 ({comments.length})
              </ButtonPrimary>
            )}
          </ul>
          <div ref={endedAnchorRef}></div>
        </div>

          {/* LIKE AND COMMENT STICKY */}
          <div className={clsx(
              "fixed bottom-8 left-1/2 -translate-x-1/2 z-11 mt-8 justify-center transition-opacity duration-300",
              showLikeAndCommentSticky ? "flex opacity-100" : "pointer-events-none opacity-0"
          )}>
            <div className="flex items-center justify-center gap-x-2 rounded-full bg-white p-1.5 text-xs shadow-lg ring-1 ring-black/5 dark:bg-neutral-800 dark:ring-white/20">
              <PostCardLikeBtn likeCount={0} liked={false} postId={postId} />
              <div className="h-4 border-s border-neutral-200 dark:border-neutral-700"></div>
              {/*<PostCardCommentBtn commentCount={0} handle={handle} />*/}
              <div className="h-4 border-s border-neutral-200 dark:border-neutral-700"></div>
              {/*<ShareDropdown handle={handle} />*/}
              <div className="h-4 border-s border-neutral-200 dark:border-neutral-700"></div>

              <button
                className={`size-8.5 items-center justify-center rounded-full bg-neutral-50 hover:bg-neutral-100 dark:bg-white/10 dark:hover:bg-white/20 ${
                  isShowScrollToTop ? 'flex' : 'hidden'
                }`}
                onClick={() => {
                  window.scrollTo({ top: 0, behavior: 'smooth' })
                }}
                title="Go to top"
              >
                <HugeiconsIcon icon={ArrowUp02Icon} size={18} strokeWidth={1.75} />
              </button>

              <button
                ref={progressRef}
                className={`size-8.5 items-center justify-center ${isShowScrollToTop ? 'hidden' : 'flex'}`}
                title="Go to top"
              >
                %
              </button>
            </div>
          </div>
      </div>

    </div>
  )
}

export default SingleContentContainer
