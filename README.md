# 오늘뭐먹지 — 인터넷 체험 버전

DB나 외부 API 서버 없이 Vercel에서 실행하는 읽기 전용 버전입니다. 사내망의 실제 운영 버전은 [foodie](https://github.com/hf-foodie/foodie)입니다.

## Vercel 배포

1. Vercel → Add New Project → GitHub `hf-foodie/foodie-vercel`을 Import합니다.
2. Framework: **Next.js**, Root Directory: **.**, Node.js: **24.x**. 설치 `npm ci`, 빌드 `npm run build`.
3. **환경 변수와 DB 연결은 필요 없습니다.** 이전에 설정한 API_URL·NEXT_PUBLIC_API_URL·APP_ORIGIN·PROTOCOL 및 인증 관련 비밀값이 있으면 삭제하세요.
4. Deploy를 실행하고 발급된 URL로 접속합니다. 이후 main 브랜치 변경은 연결된 Vercel 프로젝트가 자동 배포합니다.

## 포함된 정적 자료

2026-11-15 스냅샷: 식당 380곳, 후기 60건, 후기 댓글 21건, 소통공간 글 2건과 댓글, 흑백요리사·인턴·사장님·부사장님·사내커플 추천, 대표 사진.

사용자가 공개를 승인한 닉네임·후기·댓글을 포함합니다. 회원 로그인 ID·이메일·비밀번호 해시·복구 정보·토큰·IP·검색 이력·개인 북마크는 포함하지 않습니다. 화면 연결용 작성자 ID는 로그인 불가능한 상수로 대체했습니다. 공개 데이터는 src/data/preview-snapshot.json, 사진은 public/images에 들어 있습니다.

식당/후기 검색·필터·정렬·페이지 이동·상세·사진·기존 댓글 조회를 제공합니다. 회원가입·로그인·비밀번호 복구·내 계정·식당 등록/수정·댓글 작성·좋아요·북마크·관리 기능은 **“내부망에 정식 서비스 오픈 후 이용가능”**으로 안내합니다. 쓰기 API도 서버에서 405로 거부합니다. 회원별 검색·클릭 이벤트는 수집하지 않습니다. Vercel Production 배포에서는 Web Analytics로 기본 방문·페이지 조회 통계를 집계합니다.

Next.js는 번들된 JSON을 읽어 화면과 조회 API를 제공합니다. 별도 Java·H2·외부 API·인증 서버가 필요 없으며, Vercel 파일시스템에 데이터를 저장하지 않습니다. 순수 HTML export 방식은 아닙니다.

## 로컬 실행과 검증

- npm ci
- npm run typecheck
- npm test
- npm run lint:check
- npm run build
- npm start

DB 없는 조회, 쓰기 API 차단, 민감 필드 제외, 검색·페이지 이동 등을 테스트합니다. 사용하지 않는 주소를 API_URL로 설정해도 정적 조회가 정상 동작하는 것을 별도 포트에서 확인했습니다.

## 데이터 갱신

공개 범위를 다시 검토한 뒤 운영 준비 PC에서 `PREVIEW_SOURCE_URL`을 설정하고 `node scripts/export-preview.cjs`를 실행합니다. 실제 사내망 DB나 인증 비밀값을 커밋하지 않습니다. 사진 변경 시 승인된 정적 이미지도 갱신합니다. 데이터/사진 검토 → 테스트 → 커밋 → Vercel 재배포 순서입니다.

`/technology`의 SBOM·사내망 보안 검증은 원본 운영 릴리스 기록이며 Vercel 플랫폼 자체를 검증한 결과가 아닙니다. 검색엔진 수집 방지 헤더는 접근 통제가 아닙니다.

## Vercel 요금제와 업로드 방식

hf-foodie는 GitHub 조직 소유 저장소입니다. Vercel 공식 제한상 Hobby 팀은 조직 저장소를 직접 연결할 수 없으므로, 해당 조직 저장소 연결을 지원하는 팀/요금제를 사용해야 합니다. 무료로 배포된다고 보장하지 않습니다. 현재 자료의 용량을 고려해 CLI 업로드 대신 위의 GitHub Import 방식을 사용하세요. [공식 제한](https://vercel.com/docs/limits#connecting-a-project-to-a-git-repository)

## 무료 방문 통계 (Vercel Web Analytics)

- 외부 체험용 저장소에만 @vercel/analytics 2.0.1을 연동했습니다. 사내망 Front·Server·Foodie에는 추가하지 않습니다.
- Vercel의 Production 배포에서만 동작합니다. VERCEL_ENV는 Vercel 시스템 환경 변수이며 로컬/Preview 배포에서는 수집하지 않습니다. API 키나 DB 설정은 필요 없습니다.
- 방문자·페이지 조회 및 기본 유입/기기 통계만 사용합니다. track() 호출, 사용자 지정 이벤트, Speed Insights, 유료 추가 기능은 넣지 않았습니다.
- beforeSend에서 페이지 URL의 쿼리·해시·URL 인증 정보를 제거합니다. 검색어·필터별 통계나 회원별 활동 통계는 제공하지 않습니다.

관리자 설정:

1. Vercel에서 이 저장소가 연결된 프로젝트를 선택하고 Analytics → Enable을 누릅니다.
2. Hobby 플랜인지 확인하고 유료 Plus 추가 기능을 선택하지 않습니다.
3. 최신 main 배포가 Ready인지 확인합니다. Enable 이후 필요하면 Production 배포를 Redeploy합니다.
4. 프로젝트의 시스템 환경 변수 자동 노출 설정을 유지합니다. VERCEL_ENV를 직접 만들거나 로컬에 production으로 설정하지 않습니다.
5. 실제 운영 URL을 방문해 몇 페이지 이동한 뒤 Analytics에서 Production 데이터를 확인합니다. 수집 시작 전의 방문은 소급 집계되지 않습니다.
6. 통계가 비어 있으면 브라우저 광고 차단 여부와 /_vercel/insights/script.js 요청을 확인합니다. 로컬에서 수집이 없는 것은 정상입니다.

2026-11-15 확인 기준 Hobby는 팀 합산 월 50,000 이벤트와 최근 1개월 조회를 제공합니다. 한도 초과 시 수집이 중지되며 추가 과금은 하지 않습니다. 개인·비상업적 사용 조건은 별도로 적용됩니다.

공식 안내: https://vercel.com/docs/analytics/quickstart · https://vercel.com/docs/analytics/limits-and-pricing