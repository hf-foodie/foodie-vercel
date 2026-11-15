# 오늘뭐먹지 외부 테스트 웹 (Vercel)

사내망용 Front의 최신 화면을 별도 외부 테스트 API에 연결하는 웹 프로젝트입니다. 맛집블로그(`/blogs`), 공통 헤더, REST 자원 API 변경을 포함합니다. Java API 서버와 H2 DB는 Vercel에 포함되지 않습니다.

## 구성

브라우저 → Vercel Next.js(화면·HttpOnly 인증 쿠키·동일 출처 API 프록시) → 외부 테스트 HTTPS API → 테스트 DB·사진 저장소.

운영 DB, 운영 비밀번호, JWT 키, 업로드 스냅샷, 사내망 ZIP은 이 저장소에 넣지 않습니다. 테스트 서버는 별도 DB·키·계정·사진 저장소를 사용해야 합니다. 신규 코드 기준 API는 `hf-foodie/server`의 `dfa9cbe` 이후 버전을 사용합니다. 이 프로젝트의 화면 기준은 Front `de21d5f`입니다.

## Vercel 설치 순서

1. Vercel에서 GitHub `hf-foodie/foodie-vercel`을 Import합니다. Framework는 Next.js, Root Directory는 저장소 루트입니다.
2. Node.js 24.x를 선택합니다. 실제 제공되는 Node 버전이 package.json의 보안 최소 버전을 충족하는지 빌드 로그에서 확인합니다.
3. 서버 전용 환경 변수 `API_URL`에 외부 테스트 API의 HTTPS 주소를 입력합니다. 마지막 슬래시는 생략합니다.
4. `APP_ORIGIN`에는 실제 웹 주소(예: `https://your-project.vercel.app`)를 입력하고 `PROTOCOL=https`를 설정합니다. 도메인 변경 시 함께 수정하고 재배포합니다.
5. `NEXT_PUBLIC_API_URL`은 설정하지 않습니다. 브라우저는 `/api/backend`만 사용합니다. DB 계정·JWT 비밀키는 Vercel에 넣지 않습니다.
6. Preview에서도 별도 환경 변수를 설정합니다. 동적 Preview 주소를 사용할 경우 APP_ORIGIN을 해당 배포 주소에 맞춰야 쓰기 요청이 허용됩니다.
7. 테스트 대상자를 초대한 뒤 로그인·검색·블로그·북마크·수정 제안·관리 권한·로그아웃을 점검합니다. 외부 테스트가 끝나면 프로젝트와 테스트 서버의 접근을 종료합니다.

검색 엔진 수집 방지 헤더를 추가했습니다. 이는 접근 제어가 아니므로 Vercel Deployment Protection과 테스트 API 접근 정책을 별도로 설정하세요.

## 외부 API 준비 및 검증

- 최신 Server를 별도 서버에서 실행하고 신뢰할 수 있는 HTTPS 인증서를 적용합니다. H2를 유지할 경우 단일 API 인스턴스와 영속 디스크가 필요합니다. 임시 파일시스템이나 다중 인스턴스에서 파일 DB를 공유하지 않습니다.
- 테스트 DB 스키마와 테스트 전용 계정·역할을 준비합니다. 운영 DB를 복사하지 않습니다.
- API가 `/sessions`, `/session-tokens`, `/restaurants`, `/posts`, `/post-images` 등 최신 경로를 제공하는지 확인합니다.
- JWT는 테스트 서버에서 별도로 생성하고 운영 키를 재사용하지 않습니다.
- 프록시의 클라이언트 IP 신뢰 옵션은 기본 비활성 상태입니다. 전달 헤더를 그대로 신뢰하지 않습니다. 서버의 IP별 제한은 프록시 IP로 집계될 수 있으므로 외부 ingress의 IP 전달·보호 정책을 검증해야 합니다.
- 사용자 역할 확인, 현재 기기 로그아웃, 수정 승인, 중복 북마크·좋아요, 상세→목록 조건 복원을 점검합니다.

## 사진 업로드: 공개 전 해결할 제약

Vercel Functions 요청/응답 본문 제한은 4.5MB입니다. 현재 앱은 최대 5MB 사진을 같은 출처 프록시로 전송하므로 큰 사진 업로드/조회는 Vercel 제한에 걸릴 수 있습니다. 따라서 현재 구성만으로 기존 5MB 정책의 완전한 검증을 완료했다고 볼 수 없습니다.

5MB 정책을 그대로 시험하려면 테스트 API에 인증된 일회용 업로드·조회 URL 또는 외부 저장소의 서명 URL 방식을 추가해야 합니다. 테스트 서버·저장소가 정해진 뒤 구현·검증합니다. 먼저 작은 사진으로 기본 흐름을 확인하되 이를 전체 업로드 검증으로 대체하지 않습니다.

## 현재 준비 상태

- 프런트 소스·Vercel 설정·HTTPS 환경 변수 예시·CI 준비.
- 외부 API 주소 및 서버·DB 환경 미제공: 실제 외부 로그인·데이터·사진 업로드 검증과 Vercel 배포 URL 확인은 미완료.
- 본 저장소는 호스팅 준비 소스이며 운영 데이터가 포함된 사내망 이전 패키지와 별개입니다.
- `npm ci` → `npm run typecheck` → `npm test` → `npm run build`로 빌드를 확인합니다.

공식 참고: [Vercel Next.js](https://vercel.com/docs/frameworks/full-stack/nextjs), [Functions 제한](https://vercel.com/docs/functions/limitations), [지원 런타임](https://vercel.com/docs/functions/runtimes).

기술과 운영 페이지의 SBOM·보안 점검은 원본 사내망 릴리스의 기록입니다. 외부 테스트 서버·Vercel의 실제 런타임·OS·설정 검증 결과를 의미하지 않습니다.
