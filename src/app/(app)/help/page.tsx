import { Breadcrumb } from '@/components/krds/PageHeading'
import type { Metadata } from 'next'
import { MemberLink as Link } from '@/components/MemberAccess'
import styles from './page.module.css'

export const metadata: Metadata = {
  title: '시작하기 · 매니저 참여 안내',
  description: '주금공 임직원의 맛집 경험을 함께 가꾸는 오늘뭐먹지. 서비스 소개부터 사용법, 매니저 업무와 기술 스택까지 안내합니다.',
}

const sections = [
  ['service', '어떤 서비스인가요?'], ['guide', '이용 설명서'], ['manager', '매니저의 역할'],
  ['join', '함께 시작하기'], ['faq', '자주 묻는 질문'],
]
const domains = [
  ['식당 정보', '상호·주소·대표 메뉴를 함께 관리합니다. 모든 후기와 추천은 등록된 식당을 중심으로 연결됩니다.'],
  ['동료의 후기', '실제 방문 경험, 별점, 사진을 나눕니다. 같은 식당의 여러 후기를 비교해 나에게 맞는 한 끼를 찾습니다.'],
  ['추천과 북마크', '추천 모음집에서 새로운 식당을 발견하고 저장합니다. 북마크는 후기 한 편이 아닌 식당 단위입니다.'],
  ['소통과 개선', '맛집 제보, 정보 수정 제안, 기능 요청을 주고받습니다. 동료의 참여가 더 정확한 안내로 이어집니다.'],
]
const work = [
  ['01', '믿을 수 있는 식당 정보', '상호·주소·메뉴를 확인하고, 이전·상호 변경 등 달라진 정보를 정리합니다.', '맛집 관리 → 식당 정보 수정'],
  ['02', '동료의 제안을 좋은 정보로', '회원의 수정 제안을 검토해 승인하거나 반려합니다. 다른 사람이 먼저 수정했다면 최신 정보를 다시 확인합니다.', '맛집 관리 → 식당 정보 수정'],
  ['03', '추천과 실제 식당 연결', '추천 식당을 검색해 등록된 식당 ID로 연결합니다. 같은 이름의 다른 지점인지 주소를 확인하고, 변경 이유를 남깁니다.', '맛집 관리 → 추천 식당 연결 관리'],
  ['04', '함께 읽고 싶은 추천 콘텐츠', '추천 콘텐츠를 편집하고 게시합니다. 편집 내용은 즉시 공개되므로 저장 전에 정보와 사진을 한 번 더 확인합니다.', '맛집 관리 → 추천 콘텐츠 관리'],
]
const guide = [
  { title: '맛집 찾기', text: '맛집탐방이나 주금공 맛집에서 상호·대표 메뉴를 검색하고 본사·지사 등 조건을 선택하세요. 후기 찾기를 누르면 해당 식당의 방문 경험을 볼 수 있습니다.', href: '/search', label: '맛집 검색하기' },
  { title: '다시 찾을 식당 저장하기', text: '로그인 후 북마크를 누르세요. 저장한 맛집에서 검색하고 페이지를 이동할 수 있습니다. 후기 상세를 보고 돌아와도 읽던 목록 위치를 이어갑니다.', href: '/bookmarks', label: '저장한 맛집 보기' },
  { title: '한 끼의 경험 나누기', text: '기존 식당을 선택해 후기와 별점을 남기세요. 별점은 1~5점, 0.5점 단위입니다. 사진은 최대 5장·장당 5MB이며 JPEG·PNG·WebP를 지원합니다.', href: '/post/new', label: '후기 작성하기' },
  { title: '정보를 더 정확하게 만들기', text: '달라진 식당 정보는 수정 제안으로 알려주세요. 매니저·관리자가 검토합니다. 서비스에 대한 의견과 새로운 맛집 제보는 소통 공간을 이용하세요.', href: '/communication', label: '소통 공간 둘러보기' },
]

export default function HelpPage() {
  return (
    <main className={`kr-container kr-main ${styles.page}`}>
      <Breadcrumb current="시작하기" />
      <header className={styles.hero}>
        <div>
          <p className={styles.eyebrow}>오늘뭐먹지 · 매니저 참여 안내</p>
          <h1>당신의 한 끼가,<br />동료의 좋은 선택이 됩니다.</h1>
          <p className={styles.lead}>함께 찾고, 함께 나누는 주금공 임직원이 추천한 맛집.<br />우리의 맛집 지도를 함께 가꿀 매니저를 기다립니다.</p>
          <div className={styles.actions}>
            <a className="kr-button kr-button-primary" href="#join">매니저로 함께하기</a>
            <a className="kr-button" href="#guide">사용 방법 알아보기</a>
          </div>
        </div>
        <aside className={styles.heroCard} aria-label="함께 만드는 변화">
          <span className={styles.eyebrow}>우리가 함께 만드는 것</span>
          <h2>한 사람의 발견에서<br />모두의 맛집 지도로</h2>
          <ol><li>좋은 식당을 발견하고</li><li>정확한 정보를 연결하고</li><li>동료의 경험을 쌓습니다</li></ol>
          <p>코딩보다 중요한 것은<br /><strong>맛집에 대한 관심과 꼼꼼한 확인</strong>입니다.</p>
        </aside>
      </header>

      <nav className={styles.contents} aria-label="시작하기 목차">
        {sections.map(([id, title]) => <a key={id} href={`#${id}`}>{title}</a>)}
      </nav>

      <section id="service" className={styles.section} aria-labelledby="service-title">
        <p className={styles.eyebrow}>01 · 서비스와 도메인</p>
        <h2 id="service-title">맛집 정보에 동료의 경험을 더합니다</h2>
        <div className={styles.note}><strong>닉네임 기반의 블라인드 서비스</strong><p>우리 서비스는 블라인드 기반으로 운영합니다. ※ 회원가입 시 사용한 닉네임 기반으로 운영</p><p>동료에게는 실명 대신 닉네임으로 경험을 나눕니다. 이는 계정 정보나 서비스 운영 기록을 전혀 수집하지 않는다는 뜻은 아닙니다.</p></div>
        <p className={styles.intro}>오늘뭐먹지는 주금공 임직원을 위한 사내 맛집 공유 서비스입니다.<br />본사와 지사 주변의 식당을 찾고, 후기를 나누고, 다음에 갈 곳을 저장합니다.</p>
        <div className={styles.grid}>{domains.map(([title, text]) => <article className={styles.card} key={title}><h3>{title}</h3><p>{text}</p></article>)}</div>
        <div className={styles.note}><strong>정보를 연결하는 기준은 ‘식당 ID’입니다.</strong><p>상호가 바뀌어도 같은 식당의 후기와 추천을 이어갈 수 있습니다. 같은 이름의 다른 지점은 구분하고, 신규 등록 전에는 기존 식당을 먼저 찾아봅니다.</p></div>
      </section>

      <section id="guide" className={styles.section} aria-labelledby="guide-title">
        <p className={styles.eyebrow}>02 · 이용 설명서</p>
        <h2 id="guide-title">처음 방문했다면, 이렇게 이용하세요</h2>
        <div className={styles.grid}>{guide.map(({ title, text, href, label }, index) => <article className={styles.card} key={title}><span className={styles.number}>STEP {index + 1}</span><h3>{title}</h3><p>{text}</p><Link className="kr-link" href={href}>{label} <span aria-hidden="true">→</span></Link></article>)}</div>
        <details className={styles.details}><summary>매니저의 첫 업무 체크리스트</summary><ol><li>권한 부여 후 다시 로그인하고 ‘맛집 관리’ 메뉴를 확인합니다.</li><li>관리할 식당의 상호·지점·주소를 먼저 확인합니다.</li><li>기존 식당이 있으면 새로 만들지 않고 연결하거나 정보를 수정합니다.</li><li>변경 근거와 이유를 남기고 저장 전 내용을 확인합니다.</li><li>이용자 화면에서 상호·주소·사진·후기 연결을 다시 확인합니다.</li></ol></details>
      </section>

      <section id="manager" className={styles.section} aria-labelledby="manager-title">
        <p className={styles.eyebrow}>03 · 매니저의 역할</p>
        <h2 id="manager-title">좋은 정보를 골라, 오래 쓸 수 있게</h2>
        <p className={styles.intro}>자주 가는 식당의 변화를 살피거나 동료의 추천을 정리하는 일부터 시작할 수 있습니다. 개발 지식이 없어도 관리 화면에서 참여할 수 있습니다.</p>
        <div className={styles.grid}>{work.map(([number, title, text, route]) => <article className={styles.card} key={number}><span className={styles.number}>{number}</span><h3>{title}</h3><p>{text}</p><span className={styles.route}>{route}</span></article>)}</div>
        <div className={styles.roles}>
          <article><h3>회원</h3><p>후기·사진 공유, 북마크, 식당 정보 수정 제안</p></article>
          <article><h3>매니저</h3><p>식당 정보 직접 수정, 제안 검토, 추천 편집·식당 연결</p></article>
          <article><h3>관리자</h3><p>매니저 업무에 더해 회원 권한·활성 상태와 관리자 통계 관리</p></article>
        </div>
        <p className={styles.caption}>맛집 관리 메뉴는 매니저·관리자에게만 표시됩니다. 회원 권한 변경과 관리자 통계는 관리자 전용입니다.</p>
      </section>

      <section id="join" className={`${styles.section} ${styles.join}`} aria-labelledby="join-title">
        <p className={styles.eyebrow}>04 · 함께 시작하기</p>
        <h2 id="join-title">내가 아는 맛집 하나부터 시작해요</h2>
        <p>지역 맛집을 잘 아는 분, 정보를 꼼꼼히 살피는 분, 동료의 의견을 듣고 함께 개선하고 싶은 분을 기다립니다.</p>
        <ol className={styles.joinSteps}><li><strong>회원으로 이용하기</strong><span>가입·로그인 후 검색과 후기 기능을 경험해 보세요.</span></li><li><strong>참여 의사 전하기</strong><span>운영진에게 문의하거나 소통 공간에 관심 지역과 참여하고 싶은 일을 남겨주세요.</span></li><li><strong>권한 확인 후 시작하기</strong><span>운영진과 역할을 확인하고, 관리자가 매니저 권한을 부여하면 다시 로그인합니다.</span></li></ol>
        <div className={styles.actions}><Link href="/communication/new" className="kr-button kr-button-primary">참여 의사 남기기</Link><Link href="/about" className="kr-button">운영진 알아보기</Link><Link href="/signup" className="kr-link">아직 회원이 아니라면 가입하기 →</Link></div>
        <p className={styles.caption}>‘참여 의사 남기기’는 기존 소통 공간의 글 작성 화면으로 연결됩니다. 글을 쓰거나 가입하는 것만으로 매니저 권한이 자동 부여되지는 않습니다.</p>
      </section>

      <p id="technology" className={styles.note}>라이브러리 버전·SBOM·보안 점검과 사내망 운영은 <Link className="kr-link" href="/technology">기술과 운영 →</Link>에서 확인하세요.</p>

      <section id="faq" className={styles.section} aria-labelledby="faq-title">
        <p className={styles.eyebrow}>05 · 자주 묻는 질문</p><h2 id="faq-title">참여 전에 궁금한 점</h2>
        {[
          ['개발을 몰라도 매니저가 될 수 있나요?', '네. 콘텐츠 매니저는 식당 정보 확인, 수정 제안 검토, 추천 정리 등 관리 화면에서 하는 업무에 참여합니다. 코드 수정이나 서버 설치를 할 필요는 없습니다.'],
          ['등록된 식당을 찾지 못하면 어떻게 하나요?', '상호와 주소로 기존 식당과 다른 지점을 먼저 확인하세요. 매니저는 추천 식당 연결 관리에서 기존 식당을 검색하고, 없으면 새 식당을 등록해 바로 연결할 수 있습니다. 중복·유사 후보를 확인하고 변경 이유를 남깁니다.'],
          ['추천을 잘못 연결했을 때 되돌릴 수 있나요?', '추천 식당 연결 관리에서 연결 변경·해제가 가능하며 변경 이력이 남습니다. 상호만 보지 말고 지점과 주소까지 확인한 뒤 수정하세요.'],
          ['수정 제안을 승인했는데 충돌 안내가 나와요.', '제안 이후 다른 사람이 식당 정보를 변경했을 수 있습니다. 최신 정보와 제안 내용을 다시 비교하세요. 오래된 내용으로 덮어쓰지 않도록 확인하는 절차입니다.'],
          ['사내망에서 네이버 지도 정보를 바로 가져오나요?', '아니요. 외부 인터넷이 없는 운영 환경에서는 이미 등록된 식당과 사진을 이용합니다. 새로운 외부 정보는 별도의 준비 환경에서 조사·확인한 뒤 반영합니다.'],
        ].map(([question, answer]) => <details key={question} className={styles.details}><summary>{question}</summary><p>{answer}</p></details>)}
      </section>
      <div className={styles.bottom}><p>동료의 다음 한 끼를, 함께 더 좋게 만들어 주세요.</p><a className="kr-button kr-button-primary" href="#join">함께 시작하기</a><a className="kr-link" href="#main-content">맨 위로 ↑</a></div>
    </main>
  )
}
