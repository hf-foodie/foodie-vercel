'use client'
import { recordSearch } from '@/lib/searchAnalytics'
import { postImageUrl } from '@/lib/postImageUrl'

import ButtonCircle from '@/shared/ButtonCircle'
import { Link } from '@/shared/link'
import {
  Combobox,
  ComboboxInput,
  ComboboxOption,
  ComboboxOptions,
  Dialog,
  DialogBackdrop,
  DialogPanel,
} from '@headlessui/react'
import { MagnifyingGlassIcon } from '@heroicons/react/20/solid'
import { ArrowUpRightIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { Search01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon, IconSvgElement } from '@hugeicons/react'
import clsx from 'clsx'
import { clientFetch } from '@/lib/clientFetch'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { FC, useEffect, useState } from 'react'
import LocalDate from '../LocalDate'
import {TPostSummary} from "@/data/types";

interface Option {
  name: string
  icon: IconSvgElement
  postId?: string | undefined
  tagId?: string | undefined
}



const recommended_searches: Option[] = [
  {
      name: '흥미원',
      icon: Search01Icon,
      postId: '2',
  },
  {
      name: '궁중돼지국밥',
      icon: Search01Icon,
      postId: '11',
  },
]

const quickActions: Option[] = [
  {
    name: '통합검색',
    icon: Search01Icon,
    tagId: 'post'
  },
  {
      name: '태그검색',
      icon: Search01Icon,
    tagId: 'tag'
  },
]

const SearchModal: FC = () => {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [posts, setPosts] = useState<TPostSummary[]>([])

  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  useEffect(() => {
    if (!open || !query.trim()) return
    const controller = new AbortController()
    const timer = setTimeout(async () => {
      setError('')
      try {
        const response = await clientFetch('/posts?' + new URLSearchParams({search: query.trim(), size: '8', page: '0', order: 'most-recent'}), {signal: controller.signal})
        if (!response.ok) throw new Error('검색에 실패했습니다. 다시 시도해주세요.')
        const data = await response.json()
        if (!controller.signal.aborted) setPosts(data.content)
      } catch (error) {
        if (!controller.signal.aborted) { setPosts([]); setError(error instanceof Error ? error.message : '검색 실패') }
      } finally {
        if (!controller.signal.aborted) setLoading(false)
      }
    }, 250)
    return () => { clearTimeout(timer); controller.abort() }
  }, [query, open])

  const handleSetSearchValue = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPosts([])
    setError('')
    setLoading(!!e.target.value.trim())
    setQuery(e.target.value)
  }

  const buttonOpenModal1 = () => {
    return (
      <ButtonCircle plain aria-label="식당 검색 열기" onClick={() => setOpen(true)}>
        <HugeiconsIcon icon={Search01Icon} size={24} />
      </ButtonCircle>
    )
  }

  return (
    <>
      <>{buttonOpenModal1()}</>

      <Dialog
        className={`relative z-50`}
        open={open}
        onClose={() => {
          setOpen(false)
          setQuery('')
        }}
      >
        <DialogBackdrop
          transition
          className="fixed inset-0 z-50 bg-neutral-900/50 transition-opacity duration-300 ease-out data-closed:opacity-0"
        />

        <div className="fixed inset-0 z-50 hidden-scrollbar flex w-full overflow-y-auto sm:p-6 md:pt-20 md:pb-10">
          <DialogPanel
            transition
            className="mx-auto w-full max-w-2xl transform divide-y divide-gray-100 self-end overflow-hidden bg-white shadow-2xl ring-1 ring-black/5 transition duration-300 ease-out data-closed:translate-y-10 data-closed:opacity-0 sm:self-start sm:rounded-xl dark:divide-gray-700 dark:bg-neutral-800 dark:ring-white/10"
          >
            <Combobox
              onChange={(item: TPostSummary | null) => {
                if (!item) {
                  return
                }

                  if ('name' in item && item.name === "태그검색") {
                      router.push(`/blogs?tab=tags`)
                  } else if ('name' in item && item.name === "통합검색") {
                      recordSearch(query,'header')
                      router.push(`/blogs?s=${encodeURIComponent(query)}`)
                  } else {
                      router.push(`/posts/${item.postId}`)
                  }

                setOpen(false)
              }}
              form="search-form-combobox"
            >
              <div className="flex items-center gap-3 p-4">
                <div className="relative min-w-0 flex-1">
                  <MagnifyingGlassIcon
                    className="pointer-events-none absolute start-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400 dark:text-gray-300"
                    aria-hidden="true"
                  />
                  <ComboboxInput
                    autoFocus
                    className="block h-12 w-full min-w-0 rounded-lg border border-gray-300 bg-transparent ps-11 pe-3 text-base leading-normal text-gray-900 placeholder:text-gray-400 focus:ring-0 dark:border-gray-600 dark:text-gray-100 dark:placeholder:text-gray-300"
                    aria-label="식당명 검색"
                    placeholder="식당명을 검색하세요"
                    onChange={handleSetSearchValue}
                    data-autofocus
                  />
                </div>
                <button
                  className="flex h-12 w-11 shrink-0 items-center justify-center rounded-lg text-xs text-neutral-600 hover:bg-gray-100 dark:text-neutral-300 dark:hover:bg-neutral-700"
                  aria-label="검색창 닫기"
                  onClick={() => setOpen(false)}
                  type="button"
                >
                  <XMarkIcon className="block h-5 w-5 sm:hidden" />
                  <span className="hidden sm:block">
                    <kbd className="font-sans">Esc</kbd>
                  </span>
                </button>
              </div>

              <ComboboxOptions
                static
                as="ul"
                className="hidden-scrollbar max-h-[70vh] scroll-py-2 divide-y divide-gray-100 overflow-y-auto dark:divide-gray-700"
              >
                {query !== '' && (
                  <li className="p-2">
                    <Link className="block p-3 text-sm underline" href={`/blogs?s=${encodeURIComponent(query)}`} onClick={() => setOpen(false)}>전체 검색 결과 보기</Link>
                    <ul className="divide-y divide-gray-100 text-sm text-gray-700 dark:divide-gray-700 dark:text-gray-300">
                      {posts.length ? (
                        posts.map((post) => (
                          <ComboboxOption
                            as={'li'}
                            key={post.postId}
                            value={post}
                            className={({ focus }) =>
                              clsx(
                                'relative flex cursor-default items-center select-none',
                                focus && 'bg-neutral-100 dark:bg-neutral-700'
                              )
                            }
                          >
                            <CardPost post={post} />
                          </ComboboxOption>
                        ))
                      ) : (
                        <div className="py-5 px-4 text-center">
                          <p>{loading ? '검색 중입니다…' : error || '검색 결과가 없습니다.'}</p>
                        </div>
                      )}
                    </ul>
                  </li>
                )}

                {query === '' && (
                  <li className="p-2">
                    <h2 className="mt-4 mb-2 px-3 text-xs font-medium text-gray-500 dark:text-gray-300">
                      추천 검색어
                    </h2>

                    <ul className="text-sm text-gray-700 dark:text-gray-300">
                      {recommended_searches.map((item) => (
                        <ComboboxOption
                          as={'li'}
                          key={item.name}
                          value={item}
                          className={({ focus }) =>
                            clsx(
                              'flex cursor-default items-center rounded-md px-3 py-2 select-none',
                              focus && 'bg-neutral-100 dark:bg-neutral-700'
                            )
                          }
                        >
                          {({ focus }) => (
                            <>
                              <HugeiconsIcon
                                icon={item.icon}
                                size={24}
                                className={clsx('h-6 w-6 flex-none text-neutral-400 dark:text-gray-300')}
                              />

                              <span className="ms-3 flex-auto truncate">{item.name}</span>
                              {focus && (
                                <span className="ms-3 flex-none text-neutral-500 dark:text-gray-400">
                                  <ArrowUpRightIcon className="inline-block h-4 w-4" />
                                </span>
                              )}
                            </>
                          )}
                        </ComboboxOption>
                      ))}
                    </ul>
                  </li>
                )}

                <li className="p-2">
                  <h2 className="sr-only">Quick actions</h2>
                  <ul className="text-sm text-gray-700 dark:text-gray-300">
                    {quickActions.map((action) => (
                      <ComboboxOption
                        as={'li'}
                        key={action.name}
                        value={action}
                        className={({ focus }) =>
                          clsx(
                            'flex cursor-default items-center rounded-md px-3 py-2 select-none',
                            focus && 'bg-neutral-100 dark:bg-neutral-700'
                          )
                        }
                      >
                        {({ focus }) => (
                          <>
                            <HugeiconsIcon
                              icon={action.icon}
                              size={24}
                              className={clsx('h-6 w-6 flex-none text-neutral-400 dark:text-gray-300')}
                            />

                            <span className="ms-3 flex-auto truncate">{action.name}</span>
                            <span
                              className={clsx(
                                'ms-3 flex-none text-xs font-semibold text-neutral-400 dark:text-gray-300',
                                focus ? '' : ''
                              )}
                            >
                              <ArrowUpRightIcon className="inline-block h-4 w-4" />
                            </span>
                          </>
                        )}
                      </ComboboxOption>
                    ))}
                  </ul>
                </li>
              </ComboboxOptions>
            </Combobox>
          </DialogPanel>
        </div>
      </Dialog>
    </>
  )
}

const CardPost = ({ post }: { post: TPostSummary }) => {
  const { title, updatedAt, tags, authorNickname, imageFileNames, postId } = post

  return (
    <div className={`group relative flex flex-row-reverse gap-3 rounded-2xl p-4 sm:gap-5`}>
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <p className="text-xs leading-6 text-neutral-600 xl:text-sm/6 dark:text-neutral-400">
            <span className="capitalize">{authorNickname}</span>
            <span className="mx-1.5">·</span>
            <LocalDate date={updatedAt} />
          </p>

        </div>
        <h4 className="mt-2 text-sm leading-6 font-medium text-neutral-900 dark:text-neutral-300">
          <Link className="absolute inset-0" href={`/posts/${post.postId}`} />
          {post.title}
        </h4>
      </div>

      <div className={`relative z-0 hidden h-24 w-24 flex-shrink-0 overflow-hidden rounded-2xl sm:block`}>
        <Image
          sizes="(max-width: 600px) 180px, 400px"
          className="object-cover"
          fill
          src={postImageUrl(post.postId, imageFileNames[0])}
          alt={title || 'Card Image'}
        />
        <Link className="absolute inset-0" href={`/posts/${post.postId}`} />
      </div>
    </div>
  )
}

export default SearchModal
