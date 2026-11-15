import WidgetInfo from '@/app/(app)/posts/WidgetInfo'
import FloatingBackButton from '@/components/FloatingBackButton'
import WidgetTags from '@/components/WidgetTags'
import { searchListHref } from '@/lib/searchNavigation'
import { bookmarkReturnHref } from '@/lib/bookmarkNavigation'
import { restaurantReturnHref } from '@/lib/restaurantNavigation'
import { getPostByHandle } from '@/services/post'
import { Metadata } from 'next'
import SingleContentContainer from '../SingleContentContainer'
import SingleHeaderContainer from '../SingleHeaderContainer'

type Props = {
  params: Promise<{ handle: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { handle } = await params
  const post = await getPostByHandle(handle)

  if (!post) {
    return {
      title: 'Post not found',
      description: 'Post not found',
    }
  }

  return {
    title: post.restaurantName,
    description: post.restaurantName,
  }
}

const Page = async ({
  params,
  searchParams,
}: {
  params: Promise<{ handle: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) => {
  const query = await searchParams
  const listHref = bookmarkReturnHref(typeof query.bookmarkReturn === 'string' ? query.bookmarkReturn : null) ?? restaurantReturnHref(typeof query.restaurantReturn === 'string' ? query.restaurantReturn : null) ?? searchListHref({ get: (key) => (typeof query[key] === 'string' ? query[key] : null) })
  const { handle } = await params

  const post = await getPostByHandle(handle)
  const comments = post.comments || []

  return (
    <>
      <div className="single-post-page">
        <SingleHeaderContainer listHref={listHref} post={post} comments={comments} />
        <div className="kr-container kr-detail-layout">
          <div className="single-content">
            <SingleContentContainer post={post} comments={comments} />
          </div>

          <div className="kr-detail-aside">
            <div className="space-y-7 lg:sticky lg:top-7">
              <WidgetInfo name={post.restaurantName} address={post.address} phoneNumber={post.phoneNumber} />
              <WidgetTags tags={post.tags} />
            </div>
          </div>
        </div>
      </div>
      <FloatingBackButton href={listHref} />
    </>
  )
}

export default Page
