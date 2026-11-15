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

식당/후기 검색·필터·정렬·페이지 이동·상세·사진·기존 댓글 조회를 제공합니다. 회원가입·로그인·비밀번호 복구·내 계정·식당 등록/수정·댓글 작성·좋아요·북마크·관리 기능은 **“내부망에 정식 서비스 오픈 후 이용가능”**으로 안내합니다. 쓰기 API도 서버에서 405로 거부합니다. 통계 이벤트를 수집하거나 전송하지 않습니다.

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
