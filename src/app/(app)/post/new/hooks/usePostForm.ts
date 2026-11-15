'use client'
import { clientFetch } from '@/lib/clientFetch'

import { ThemeContext } from '@/app/theme-provider'
import { TPost, TRestaurant } from '@/data/types'
import { useRouter } from 'next/navigation'
import React, { useEffect, useRef, useState } from 'react'

export interface Tag {
  id: string
  name: string
  color?: string
}

export const usePostForm = () => {
  const router = useRouter()
  const [error, setError] = useState('')
  const submitting = useRef(false)
  const previewObjectUrls = useRef<string[]>([])
  useEffect(() => () => previewObjectUrls.current.forEach((url) => URL.revokeObjectURL(url)), [])
  const themeContext = React.useContext(ThemeContext)
  const restaurants = themeContext?.restaurants || []

  const [title, setTitle] = useState('')
  const [oneLineReviews, setOneLineReviews] = useState<Tag[]>([])
  const [summary, setSummary] = useState('')
  const [rating, setRating] = useState(5)
  const [address, setAddress] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [restaurantName, setRestaurantName] = useState('')
  const [selectedRestaurant, setSelectedRestaurant] = useState<TRestaurant | null>(null)
  const [query, setQuery] = useState('')
  const [tags, setTags] = useState<Tag[]>([])
  const [images, setImages] = useState<File[]>([])
  const [imagePreviews, setImagePreviews] = useState<string[]>([])
  const [mainImageIndex, setMainImageIndex] = useState<number>(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isPreviewMode, setIsPreviewMode] = useState(false)
  const [previewPost, setPreviewPost] = useState<TPost | null>(null)

  const filteredRestaurants =
    query === ''
      ? restaurants
      : restaurants.filter((restaurant) =>
          restaurant.name.toLowerCase().replace(/\s+/g, '').includes(query.toLowerCase().replace(/\s+/g, ''))
        )

  const handleSelectRestaurant = (restaurant: TRestaurant | null) => {
    setSelectedRestaurant(restaurant)
    if (restaurant) {
      setRestaurantName(restaurant.name)
      setAddress(restaurant.address)
      setPhoneNumber(restaurant.phoneNumber)
    }
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0]

      if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > 5 * 1024 * 1024) {
        setError('JPEG·PNG·WebP 이미지, 장당 5MB까지 등록할 수 있습니다.')
        return
      }
      if (images.length >= 5) {
        setError('이미지는 최대 5개까지 등록할 수 있습니다.')
        return
      }

      setError('')
      setImages((prev) => [...prev, file])

      const preview = URL.createObjectURL(file)
      previewObjectUrls.current.push(preview)
      setImagePreviews((prev) => [...prev, preview])

      e.target.value = ''
    }
  }

  const handleRemoveImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index))
    setImagePreviews((prev) => prev.filter((_, i) => i !== index))

    if (mainImageIndex === index) {
      setMainImageIndex(0)
    } else if (mainImageIndex > index) {
      setMainImageIndex((prev) => prev - 1)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    setError('')
    if (!selectedRestaurant) {
      setError('등록된 식당을 선택해주세요.')
      return
    }
    const newPost: TPost = {
      postId: 'preview',
      restaurantId: selectedRestaurant?.restaurantId || 0,
      restaurantName: restaurantName,
      authorId: 'me',
      authorNickname: '사용자',
      title,
      summary,
      rating,
      updatedAt: new Date().toISOString(),
      viewCount: 0,
      likeCount: 0,
      liked: false,
      bookmarked: false,
      address,
      phoneNumber,
      tags: tags.map((t) => t.name),
      badges: [],
      oneLineReviews: oneLineReviews.map((r) => r.name),
      imageFileNames: images.map((_, i) => (i === mainImageIndex ? 'main' : `image-${i}`)),
      comments: [],
    }

    setPreviewPost(newPost)
    setIsPreviewMode(true)
    window.scrollTo(0, 0)
  }

  const handleFinalSubmit = async () => {
    if (submitting.current) return
    setError('')
    submitting.current = true
    setIsSubmitting(true)

    try {
      if (!selectedRestaurant) throw new Error('등록된 식당을 선택해주세요.')
      if (!title.trim() || title.length > 200 || !summary.trim() || summary.length > 10000)
        throw new Error('제목은 1~200자, 본문은 1~10,000자로 입력해주세요.')
      if (rating < 1 || rating > 5 || rating * 2 !== Math.round(rating * 2))
        throw new Error('별점은 1~5점, 0.5점 단위입니다.')
      for (const list of [tags, oneLineReviews]) {
        if (list.length > 10 || list.some((x) => !x.name.trim() || x.name.length > 30))
          throw new Error('태그·한줄평은 각각 10개, 항목당 30자까지 입력해주세요.')
      }
      const ordered = images.length ? [images[mainImageIndex], ...images.filter((_, i) => i !== mainImageIndex)] : []
      const imageFileNames: string[] = []
      for (const image of ordered) {
        const body = new FormData()
        body.append('file', image)
        const uploaded = await clientFetch('/post-images', { method: 'POST', body })
        if (!uploaded.ok) {
          const error = await uploaded.json()
          throw new Error(error.message || '이미지 업로드에 실패했습니다.')
        }
        imageFileNames.push((await uploaded.json()).path)
      }
      const response = await clientFetch('/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          restaurantId: selectedRestaurant.restaurantId,
          title: title.trim(),
          summary: summary.trim(),
          rating,
          tags: [...new Set(tags.map((x) => x.name.trim()))],
          oneLineReviews: [...new Set(oneLineReviews.map((x) => x.name.trim()))],
          badges: [],
          imageFileNames,
        }),
      })
      if (!response.ok) {
        const error = await response.json()
        throw new Error(
          error.fields
            ? Object.entries(error.fields)
                .map(([key, value]) => key + ': ' + value)
                .join('\n')
            : error.message || '등록에 실패했습니다.'
        )
      }
      const postId = await response.json()

      router.push(`/posts/${postId}`)
    } catch (error) {
      console.error('Failed to submit post:', error)
      setError(error instanceof Error ? error.message : '포스트 등록에 실패했습니다.')
    } finally {
      submitting.current = false
      setIsSubmitting(false)
    }
  }

  return {
    error,
    // State
    title,
    setTitle,
    oneLineReviews,
    setOneLineReviews,
    summary,
    setSummary,
    rating,
    setRating,
    address,
    setAddress,
    phoneNumber,
    setPhoneNumber,
    restaurantName,
    setRestaurantName,
    selectedRestaurant,
    query,
    setQuery,
    tags,
    setTags,
    images,
    imagePreviews,
    mainImageIndex,
    setMainImageIndex,
    isSubmitting,
    isPreviewMode,
    setIsPreviewMode,
    previewPost,
    filteredRestaurants,

    // Handlers
    handleSelectRestaurant,
    handleImageChange,
    handleRemoveImage,
    handleSubmit,
    handleFinalSubmit,
  }
}
