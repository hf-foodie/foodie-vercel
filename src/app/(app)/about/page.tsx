import SectionContributor from '@/app/(app)/about/SectionContributor'
import SectionHero from '@/app/(app)/about/SectionHero'
import { Breadcrumb, PageHeading } from '@/components/krds/PageHeading'
import rightImg from '@/images/about/hero.png'
import { Divider } from '@/shared/divider'
import SectionAdministarator from './SectionAdministarator'

const PageAbout = ({}) => {
  return (
    <main className="kr-container kr-main kr-about">
      <Breadcrumb current="서비스 소개" />
      <PageHeading title="서비스 소개" description="동료와 함께 찾고 나누는 맛집 이야기" />
      <div className="space-y-10">
        <SectionHero
          rightImg={rightImg}
          heading="오늘뭐먹지?"
          btnText=""
          subHeading="주택금융공사 임직원이 추천하는 맛집 소개, 오늘의 스트레스를 맛있는 음식을 생각하면서 떨쳐버리세요"
        />
        <Divider />
        <SectionContributor />
        <Divider />
        <SectionAdministarator />
      </div>
    </main>
  )
}

export default PageAbout
