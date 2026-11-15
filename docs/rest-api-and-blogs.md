# API REST 스타일 점검 및 맛집블로그 분리

점검일: 2026-11-15. 아래는 리소스 중심 HTTP API 점검 결과이며, HATEOAS까지 적용한 엄격한 REST 성숙도 인증을 의미하지 않는다.
기준: [RFC 9110 HTTP Semantics](https://www.rfc-editor.org/rfc/rfc9110.html) — 메서드 의미, 안전한 조회, PUT/DELETE 멱등성, 상태 코드.

## 화면 변경
- /search: 맛집탐방. 등록 식당 검색·지역·주소·식당명·부점 필터 및 페이지 이동.
- /blogs: 맛집블로그. 후기·태그 탭, 정렬, 검색·필터, 후기 페이지 이동.
- PC/모바일 메뉴에서 맛집탐방 바로 다음에 맛집블로그 표시.
- 식당의 후기 찾기·북마크 후기 링크는 /blogs 사용. 이전 /search의 restaurantId·태그·추천/북마크 복귀 등 후기 전용 링크는 조건을 보존해 /blogs로 이동.
- 상세에서 목록으로 돌아올 때 블로그 조건·페이지·스크롤, 원래 식당 목록 복귀 조건을 유지.

## 수정한 계약
| 이전 | 권장 API | 의미 |
|---|---|---|
| POST /auth/register | POST /members | 가입, 201 |
| POST /auth/login | POST /sessions | 로그인 세션 생성, 201 |
| POST /auth/refresh | POST /session-tokens | 갱신 토큰으로 새 토큰 발급, 서버 전용 |
| POST /auth/logout | DELETE /sessions/current | 현재 기기 세션 폐기, 204 |
| POST /auth/logout-all | DELETE /sessions | 전체 세션 폐기, 204, 브라우저 게이트웨이는 기존 정책대로 차단 |
| GET /password/hint | POST /password-recovery/challenges | 본문으로 식별 정보를 전달해 힌트 조회 |
| POST /password/verify | POST /password-recovery/verifications | 힌트 검증, 시도 제한 유지 |
| POST /password/reset | POST /password-resets | 일회용 토큰으로 비밀번호 변경, 204 |
| POST /me | PATCH /me | 내 프로필 부분 변경 |
| PUT /admin/members/{id}/activate 또는 deactivate | PUT /admin/members/{id}/status | ACTIVE/INACTIVE 상태 지정, 204, 반복 요청 시 토큰 버전 재변경 방지 |
| POST /posts/{id}/like | PUT 또는 DELETE /posts/{id}/like | 좋아요 저장·해제, 반복 요청해도 상태·집계 유지 |
| POST /posts/{id}/bookmark | PUT 또는 DELETE /posts/{id}/bookmark | 호환 후기 북마크 저장·해제. 새 화면은 식당 북마크 API 사용 |
| POST /restaurant-change-requests/restaurants/{id} | POST /restaurants/{id}/change-requests | 식당 수정 제안 생성, 201 |
| POST /restaurant-change-requests/{id}/approve 또는 reject | POST /restaurant-change-requests/{id}/decisions | APPROVED/REJECTED 결정 생성, 201 |
| POST /curated-links/registration-check | GET /curated-links/restaurant-duplicates?name=…&address=… | 중복 후보 조회 |
| POST /curated-links/{source}/{id}/register | POST /curated-links/{source}/{id}/registrations | 등록·연결 작업 생성, 201 |

기존 경로는 외부/이전 클라이언트 호환을 위해 남겨 두었다. 새 화면은 권장 경로를 사용한다. 삭제 일정은 정하지 않았으며 호출 현황 확인 후 별도 배포에서 제거한다.
로그인 게이트웨이는 토큰을 JSON으로 노출하지 않고 HttpOnly 쿠키를 발급한다. 브라우저에는 성공 확인 응답을 반환하며 서버의 토큰 응답과 구분한다. 원본 확인·갱신 제한·Retry-After·역할/기기 검증은 유지한다.

## 전체 점검 결론
- 식당·후기·소통글·댓글·이미지·추천·태그·부점·매거진·인플루언서·추천 연결·변경 이력은 명사형 리소스와 GET/POST/PUT/DELETE 의미가 맞아 불필요한 경로 변경을 하지 않았다.
- count/statistics/history/analytics는 집계·이력 조회 리소스로 유지한다. 관리 경로 /admin, /management 자체가 HTTP 의미 위반은 아니다.
- 후기·댓글·소통글·답글·이미지·추천 생성 성공을 201로 정리했다. 상태를 본문으로 반환하는 저장/해제는 200, 본문 없는 새 세션 폐기·상태 변경은 204를 사용한다.
- 잘못된 메서드는 405 + Allow, 미지원 미디어 형식은 415, 없는 리소스는 404를 반환하도록 보완했다. 인증 401, 권한 403, 충돌 409, 시도 제한 429를 유지한다.
- 후기 댓글 수정 및 소통글 답글 삭제 시 부모 리소스 ID 일치를 검증하여 다른 게시글 경로로 조작할 수 없게 했다.
- GET 조회수 및 API 로그 기록은 요청한 업무 상태 변경이 아닌 조회 계측이다. HTTP 안전성의 부수 효과 허용 범위로 유지한다.
- DB 스키마 변경 없음. 모든 운영 기능은 외부 인터넷 호출 없이 사용 가능.

## 검증 시나리오
- 같은 사용자/후기에 PUT 좋아요 두 번 → 한 번만 증가, DELETE 두 번 → 한 번만 감소. 북마크도 같은 상태 유지.
- 새 세션 API 로그인·현재 기기 로그아웃, 폐기된 토큰 거부, 쿠키 토큰 비노출, 직접 갱신·전체 로그아웃 브라우저 경로 차단.
- 일반 회원의 관리자 상태 변경·추천 중복 후보 조회·승인 결정 거부. 매니저의 결정 생성 허용.
- 잘못된 부모 ID로 후기 댓글 수정/소통 답글 삭제 → 404, 원본 보존.
- 블로그 조건·페이지의 상세 왕복 및 식당/북마크 원래 목록 복귀.
- 이전 경로 회귀 테스트, 신규 계약 테스트, 타입·린트·빌드 및 PC/모바일 화면 확인.

검증 결과: Server 103개 테스트, Front 37개 테스트 및 타입/린트 검사를 통과했다.

## 컨트롤러별 엔드포인트 목록
전체 소스 컨트롤러에서 수집한 매핑 96건(호환 매핑 포함). Spring의 암시적 HEAD/OPTIONS 및 테스트 엔드포인트는 제외.

| 메서드 | 경로 | 판정 | 컨트롤러 |
|---|---|---|---|
| POST | /analytics/events | 유지/개선 완료 | AnalyticsController.java |
| GET | /admin/analytics | 유지/개선 완료 | AnalyticsController.java |
| GET | /admin/analytics/members | 유지/개선 완료 | AnalyticsController.java |
| GET | /management/summary | 유지/개선 완료 | AnalyticsController.java |
| GET | /blackwhites | 유지/개선 완료 | BlackWhiteController.java |
| PUT | /restaurants/{id}/bookmark | 유지/개선 완료 | RestaurantBookmarkController.java |
| DELETE | /restaurants/{id}/bookmark | 유지/개선 완료 | RestaurantBookmarkController.java |
| GET | /restaurants/{id}/bookmark | 유지/개선 완료 | RestaurantBookmarkController.java |
| GET | /me/bookmarks/ids | 유지/개선 완료 | RestaurantBookmarkController.java |
| GET | /me/bookmarks | 유지/개선 완료 | RestaurantBookmarkController.java |
| POST | /members | 유지/개선 완료 | ResourceApiController.java |
| POST | /sessions | 유지/개선 완료 | ResourceApiController.java |
| POST | /session-tokens | 유지/개선 완료 | ResourceApiController.java |
| DELETE | /sessions/current | 유지/개선 완료 | ResourceApiController.java |
| DELETE | /sessions | 유지/개선 완료 | ResourceApiController.java |
| POST | /password-recovery/challenges | 유지/개선 완료 | ResourceApiController.java |
| POST | /password-recovery/verifications | 유지/개선 완료 | ResourceApiController.java |
| POST | /password-resets | 유지/개선 완료 | ResourceApiController.java |
| POST | /restaurants/{id}/change-requests | 유지/개선 완료 | ResourceApiController.java |
| POST | /restaurant-change-requests/{id}/decisions | 유지/개선 완료 | ResourceApiController.java |
| GET | /admin/api-logs/statistics | 유지/개선 완료 | AdminApiLogController.java |
| GET | /admin/operations | 유지/개선 완료 | OperationsController.java |
| POST | /communications | 유지/개선 완료 | CommunicationController.java |
| GET | /communications/{id} | 유지/개선 완료 | CommunicationController.java |
| GET | /communications/{id}/replies | 유지/개선 완료 | CommunicationController.java |
| GET | /communications | 유지/개선 완료 | CommunicationController.java |
| PUT | /communications/{id} | 유지/개선 완료 | CommunicationController.java |
| DELETE | /communications/{id} | 유지/개선 완료 | CommunicationController.java |
| POST | /communications/{id}/replies | 유지/개선 완료 | CommunicationController.java |
| DELETE | /communications/{id}/replies/{replyId} | 유지/개선 완료 | CommunicationController.java |
| GET | /footprints/ceo | 유지/개선 완료 | FootprintController.java |
| GET | /footprints/cc | 유지/개선 완료 | FootprintController.java |
| GET | /influencers | 유지/개선 완료 | InfluencerController.java |
| GET | /influencers/{epno} | 유지/개선 완료 | InfluencerController.java |
| GET | /magazines | 유지/개선 완료 | MagazineController.java |
| GET | /magazines/{magazineId} | 유지/개선 완료 | MagazineController.java |
| PUT | /admin/members/{id}/status | 유지/개선 완료 | AdminMemberController.java |
| PUT | /admin/members/{id}/role | 유지/개선 완료 | AdminMemberController.java |
| PUT | /admin/members/{id}/deactivate | 호환용 유지 · 신규 사용 금지 | AdminMemberController.java |
| PUT | /admin/members/{id}/activate | 호환용 유지 · 신규 사용 금지 | AdminMemberController.java |
| GET | /contributors/featured | 유지/개선 완료 | ContributorController.java |
| POST | /auth/register | 호환용 유지 · 신규 사용 금지 | AuthController.java |
| POST | /auth/login | 호환용 유지 · 신규 사용 금지 | AuthController.java |
| POST | /auth/refresh | 호환용 유지 · 신규 사용 금지 | AuthController.java |
| POST | /auth/logout | 호환용 유지 · 신규 사용 금지 | AuthController.java |
| POST | /auth/logout-all | 호환용 유지 · 신규 사용 금지 | AuthController.java |
| GET | /me | 유지/개선 완료 | MeController.java |
| POST | /me | 호환용 유지 · 신규 사용 금지 | MeController.java |
| PATCH | /me | 프로필 부분 변경 · POST는 호환용 | MeController.java |
| GET | /password/hint | 호환용 유지 · 신규 사용 금지 | PasswordController.java |
| POST | /password/verify | 호환용 유지 · 신규 사용 금지 | PasswordController.java |
| POST | /password/reset | 호환용 유지 · 신규 사용 금지 | PasswordController.java |
| GET | /offices | 유지/개선 완료 | OfficeController.java |
| GET | /offices/{officeId} | 유지/개선 완료 | OfficeController.java |
| POST | /post-images | 유지/개선 완료 | ImageController.java |
| GET | /post-images/{id} | 유지/개선 완료 | ImageController.java |
| PUT | /posts/{postId}/bookmark | 유지/개선 완료 | PostBookmarkController.java |
| DELETE | /posts/{postId}/bookmark | 유지/개선 완료 | PostBookmarkController.java |
| POST | /posts/{postId}/bookmark | 호환용 유지 · 신규 사용 금지 | PostBookmarkController.java |
| GET | /posts/{postId}/bookmark | 유지/개선 완료 | PostBookmarkController.java |
| GET | /posts/{postId}/comments | 유지/개선 완료 | PostCommentController.java |
| GET | /posts/{postId}/comments/{commentId} | 유지/개선 완료 | PostCommentController.java |
| POST | /posts/{postId}/comments | 유지/개선 완료 | PostCommentController.java |
| PUT | /posts/{postId}/comments/{commentId} | 유지/개선 완료 | PostCommentController.java |
| DELETE | /posts/{postId}/comments/{commentId} | 유지/개선 완료 | PostCommentController.java |
| POST | /posts | 유지/개선 완료 | PostController.java |
| GET | /posts/count | 유지/개선 완료 | PostController.java |
| GET | /posts | 유지/개선 완료 | PostController.java |
| GET | /posts/{postId} | 유지/개선 완료 | PostController.java |
| PUT | /posts/{postId}/like | 유지/개선 완료 | PostLikeController.java |
| DELETE | /posts/{postId}/like | 유지/개선 완료 | PostLikeController.java |
| POST | /posts/{postId}/like | 호환용 유지 · 신규 사용 금지 | PostLikeController.java |
| GET | /posts/{postId}/like | 유지/개선 완료 | PostLikeController.java |
| PUT | /posts/{postId}/rating | 유지/개선 완료 | PostRatingController.java |
| GET | /curated-links | 유지/개선 완료 | CuratedLinkController.java |
| GET | /curated-links/restaurants | 유지/개선 완료 | CuratedLinkController.java |
| PUT | /curated-links/{source}/{id} | 유지/개선 완료 | CuratedLinkController.java |
| GET | /curated-links/{source}/{id} | 유지/개선 완료 | CuratedLinkController.java |
| GET | /curated-links/restaurant-duplicates | 유지/개선 완료 | CuratedLinkController.java |
| POST | /curated-links/{source}/{id}/registrations | 유지/개선 완료 | CuratedLinkController.java |
| POST | /curated-links/registration-check | 호환용 유지 · 신규 사용 금지 | CuratedLinkController.java |
| POST | /curated-links/{source}/{id}/register | 호환용 유지 · 신규 사용 금지 | CuratedLinkController.java |
| GET | /curated-links/{source}/{id}/history | 유지/개선 완료 | CuratedLinkController.java |
| GET | /recommendations/intern | 유지/개선 완료 | RecommendationController.java |
| POST | /recommendations/intern | 유지/개선 완료 | RecommendationController.java |
| PUT | /recommendations/intern/{id} | 유지/개선 완료 | RecommendationController.java |
| GET | /recommendations/intern/{id}/history | 유지/개선 완료 | RecommendationController.java |
| POST | /restaurant-change-requests/restaurants/{restaurantId} | 호환용 유지 · 신규 사용 금지 | RestaurantChangeController.java |
| GET | /restaurant-change-requests | 유지/개선 완료 | RestaurantChangeController.java |
| POST | /restaurant-change-requests/{id}/approve | 호환용 유지 · 신규 사용 금지 | RestaurantChangeController.java |
| POST | /restaurant-change-requests/{id}/reject | 호환용 유지 · 신규 사용 금지 | RestaurantChangeController.java |
| GET | /restaurants | 유지/개선 완료 | RestaurantController.java |
| GET | /restaurants/count | 유지/개선 완료 | RestaurantController.java |
| GET | /restaurants/{id} | 유지/개선 완료 | RestaurantController.java |
| PUT | /restaurants/{id} | 유지/개선 완료 | RestaurantController.java |
| GET | /tags | 유지/개선 완료 | TagController.java |
