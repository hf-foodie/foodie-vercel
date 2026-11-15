
'use client'
import { clientFetch } from '@/lib/clientFetch'

import { HeadingWithSubProps } from '@/shared/Heading'
import clsx from 'clsx'
import { FC, useEffect, useState } from 'react'
import SectionMagazineHeader from "@/components/SectionMagazine/SectionMagazineHeader";
import CardMain from "@/components/SectionMagazine/Card/CardMain";
import CardSub from "@/components/SectionMagazine/Card/CardSub";
import {TMagazine} from "@/data/types";

interface Props extends Pick<HeadingWithSubProps, 'subHeading' | 'dimHeading'> {
  magazines: (TMagazine)[]
  heading?: string
  className?: string
  subHeading?: string
}

const SectionMagazine: FC<Props> = ({ magazines: initialMagazines, heading, className, subHeading, dimHeading }) => {
  const [magazines, setMagazines] = useState(initialMagazines)
  const colorOfCardMain = 'indigo'
  const nameColors = ['red', 'yellow', 'green'];

  useEffect(() => {
    const fetchUserStatus = async () => {



      const baseUrl = process.env.NEXT_PUBLIC_API_URL || ''

      const updatedMagazines = await Promise.all(
        initialMagazines.map(async (magazine) => {
          if (!magazine) return magazine

          try {
            const [likeRes, bookmarkRes, commentsRes] = await Promise.all([
              clientFetch(`${baseUrl}/posts/${magazine.postId}/like`, {
                headers: {  }
              }),
              clientFetch(`${baseUrl}/posts/${magazine.postId}/bookmark`, {
                headers: {  }
              }),
              clientFetch(`${baseUrl}/posts/${magazine.postId}/comments`, {
                headers: {  }
              })
            ])

            let liked = false
            let likeCount = 0
            let bookmarked = false
            let commentCount = 0

            if (likeRes.ok) {
              const likeData = await likeRes.json()
              liked = likeData.liked
              likeCount = likeData.count ?? likeCount
            }
            if (bookmarkRes.ok) {
              const bookmarkData = await bookmarkRes.json()
              bookmarked = bookmarkData.bookmarked
            }
            if (commentsRes.ok) {
              const commentsData = await commentsRes.json()
              commentCount = Array.isArray(commentsData) ? commentsData.length : commentCount
            }

            return { ...magazine, liked, likeCount, bookmarked, commentCount }
          } catch (error) {
            console.error(`Failed to fetch status for post ${magazine.magazineId}:`, error)
            return magazine
          }
        })
      )
      setMagazines(updatedMagazines)
    }

    fetchUserStatus()
  }, [initialMagazines])

  const magazinesMain = magazines[0]
  const magazinesSub = magazines.slice(1)

  return (
    <div className={clsx('section-magazine-1', className)}>
      <SectionMagazineHeader
        subHeading={subHeading}
        dimHeading={dimHeading}
        heading={heading}
      />
      <div className="grid grid-cols-1 gap-6 md:gap-8 lg:grid-cols-2">
        {magazinesMain && <CardMain size="large" magazine={magazinesMain} color={colorOfCardMain} />}
        <div className="grid gap-6 md:gap-8">
            {magazinesSub.map((magazine, index) => (
                magazine ? (
                    <CardSub key={magazine.postId} magazine={magazine} color={nameColors[index % nameColors.length]} />
                ) : (
                    <div key={index} className="empty-spot-placeholder" /> // 예시
                )
            ))}
        </div>
      </div>
    </div>
  )
}

export default SectionMagazine
