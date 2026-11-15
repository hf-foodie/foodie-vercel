'use client'

import { StarIcon as StarIconOutline } from '@heroicons/react/24/outline'
import { StarIcon } from '@heroicons/react/24/solid'
import React from 'react'

interface Props {
  rating: number
  setRating: (rating: number) => void
}

const RatingSelector: React.FC<Props> = ({ rating, setRating }) => {
  return (
    <div className="block">
      <span className="font-medium text-neutral-800 dark:text-neutral-200">평점</span>
      <div className="mt-1 flex flex-wrap items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => setRating(star)}
            className="min-w-11"
            aria-label={star + '점 선택'}
            aria-pressed={rating === star}
          >
            <span className="relative block h-8 w-8" aria-hidden="true">
              <StarIconOutline className="absolute inset-0 h-8 w-8 text-neutral-300 dark:text-neutral-600" />
              <span className="absolute inset-y-0 left-0 overflow-hidden" style={{ width: `${Math.max(0, Math.min(1, rating - star + 1)) * 100}%` }}>
                <StarIcon className="h-8 w-8 max-w-none text-yellow-500" />
              </span>
            </span>
          </button>
        ))}
        <label className="ml-2">
          작성자 별점{' '}
          <select aria-label="작성자 별점" value={rating} onChange={(e) => setRating(Number(e.target.value))}>
            {[1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5].map((value) => (
              <option key={value} value={value}>
                {value} / 5
              </option>
            ))}
          </select>
        </label>
      </div>
    </div>
  )
}

export default RatingSelector
