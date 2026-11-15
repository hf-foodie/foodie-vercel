import { Breadcrumb, PageHeading } from '@/components/krds/PageHeading'
import CommunicationClient from './CommunicationClient'
export default async function CommunicationPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const params = await searchParams
  return (
    <main className="kr-container kr-main">
      <Breadcrumb current="소통 공간" />
      <PageHeading
        title={params.mine === 'true' ? '내 글 찾기' : '소통 공간'}
        description="맛집 제보와 서비스에 대한 의견을 나눠주세요."
      />
      <CommunicationClient key={JSON.stringify(params)} />
    </main>
  )
}
