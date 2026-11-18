import WeeklyRanking from '@/components/WeeklyRanking'
import BackgroundSection from '@/components/BackgroundSection'
import SectionAdvertisement from '@/components/SectionAdvertisement/SectionAdvertisement'
import SectionBecommingAFoodie from '@/components/SectionBecommingAFoodie'
import SectionMagazine from '@/components/SectionMagazine/SectionMagazine'
import SectionMagazineTour from '@/components/SectionMagazineTour/SectionMagazineTour'
import SectionSliderBranches from '@/components/SectionSliderBranches/SectionSliderBranches'
import { getTouristAttraction } from '@/data/tourist-attraction'
import becomeAuthorImg from '@/images/BecomeAnAuthorImg.png'
import { validateAuth } from '@/services/auth'
import { getBranches } from '@/services/branch'
import { getMagazines } from '@/services/magazine'
import { getAllRestaurantList } from '@/services/restaurant'
import { latestRestaurants } from '@/lib/latestRestaurants'
import { MemberLink as Link } from '@/components/MemberAccess'
import LatestRestaurantCarousel from '@/components/LatestRestaurantCarousel'

const Page = async () => {
  const accessToken = await validateAuth()
  const magazines = (await getMagazines(accessToken || '')).slice(0, 4)
  const branches = await getBranches(accessToken || '')
  const latest = latestRestaurants(await getAllRestaurantList(), Infinity)
  const touristAttractions = await getTouristAttraction()

  return (
    <div className="relative">
      <section className="kr-hero">
        <div className="kr-container">
          <div className="kr-kicker">오늘뭐먹지 · 함께 찾는 맛집</div>
          <h1>
            오늘 점심, <em>어디서 먹을까요?</em>
          </h1>
          <p>동료들의 생생한 후기와 추천으로 나에게 맞는 맛집을 찾아보세요.</p>
          <form action="/search" className="kr-search-form" role="search">
            <label className="sr-only" htmlFor="home-search">
              맛집 검색
            </label>
            <input id="home-search" name="s" type="search" placeholder="식당명, 제목, 작성자 검색" />
            <button className="kr-button kr-button-primary">검색</button>
          </form>
          <div className="kr-popular">
            <span>바로 찾기</span>
            {['부산', '서울', '대구', '대전'].map((city) => (
              <Link key={city} href={'/search?address=' + encodeURIComponent(city)}>
                {city}
              </Link>
            ))}
          </div>
        </div>
      </section>
      <div className="kr-container">
        <WeeklyRanking compact />
        <section className="kr-home-section">
          <div className="kr-section-heading">
            <h2>취향에 맞게 둘러보기</h2>
          </div>
          <div className="kr-quick-grid">
            {[
              ['/restaurant/hf', '주금공 맛집', '우리 지사 주변 맛집'],
              ['/influencer/intern', '인턴’s Pick', '동료들이 추천하는 한 끼'],
              ['/search?sort-by=most-liked', '좋아요 많은 맛집', '후기로 찾는 인기 맛집'],
              ['/post/new', '후기 등록', '나만의 맛집을 나눠요'],
            ].map(([href, title, sub]) => (
              <Link href={href} key={href}>
                <span>
                  <strong>{title}</strong>
                  <small>{sub}</small>
                </span>
                <span aria-hidden="true">→</span>
              </Link>
            ))}
          </div>
        </section>
        <section className="kr-home-section">
          <div className="kr-section-heading">
            <h2>새로 올라온 맛집</h2>
            <Link href="/restaurant/hf" className="kr-link">
              전체 보기 →
            </Link>
          </div>
          <LatestRestaurantCarousel restaurants={latest} />
        </section>
      </div>

      <div className="kr-container kr-home-legacy">
        {magazines.length > 0 && (
          <SectionMagazine
            className="pt-16 lg:pt-20"
            heading="HF 매거진"
            subHeading="맛집원정대가 금주의 맛집을 추천해드려요"
            magazines={magazines}
          />
        )}

        <div className="relative py-16 lg:py-20">
          <BackgroundSection />
          <SectionSliderBranches
            heading="지역별 맛집"
            subHeading="본사 및 지사 인근에 위치한 지역별 맛집을 찾아보세요"
            branches={branches}
          />
        </div>

        <SectionMagazineTour
          touristAttractions={touristAttractions}
          heading="어디로 놀러갈까요?"
          dimHeading="친구와 연인과 가족과 함께 가보면 좋은 관광명소 소개"
        />

        <SectionAdvertisement />
        <SectionBecommingAFoodie rightImg={becomeAuthorImg} />
      </div>
    </div>
  )
}

export default Page
