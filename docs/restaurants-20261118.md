# 식당 정보·대표 사진 반영 — 2026-11-18

대끼리야·송원물회횟집·동면식밀면은 신규 등록했습니다. 굿모닝홍콩 전포(ID 128)와 바오하우스(ID 107)는 기존 지점 정보를 보완하여 후기 연결을 유지했습니다. 주소와 전화번호는 사용자 제공 값을 적용했습니다.

- **대끼리야 (ID 448)**: 부산 동래구 명륜로129번다길 15 대끼리야, 051-554-6767
  - [사진 확인 출처](https://www.diningcode.com/profile.php?rid=JLtRaoUUdQGs) · 대끼리야 조개와 해산물 요리
  - 파일: `public/images/restaurant/thumbnail/448-verified-20261118.webp`

- **송원물회횟집 (ID 449)**: 부산 해운대구 송정중앙로15번길 86, 0507-1442-4420
  - [사진 확인 출처](https://www.diningcode.com/profile.php?rid=H6LwDd72xDeL) · 송원물회횟집 물회
  - 파일: `public/images/restaurant/thumbnail/449-verified-20261118.webp`

- **굿모닝홍콩 전포 (ID 128)**: 부산 부산진구 서전로47번길 19 1층 굿모닝홍콩, 0507-1334-3724
  - [사진 확인 출처](https://www.diningcode.com/profile.php?rid=ueWgYHpUhbic) · 굿모닝홍콩 전포 면 요리와 덮밥
  - 파일: `public/images/restaurant/thumbnail/128-verified-20261118.webp`

- **동면식밀면 (ID 450)**: 부산 수영구 광안해변로 251 1층, 0507-1464-5770
  - [사진 확인 출처](https://www.diningcode.com/profile.php?rid=xmokpLvHDua5) · 동면식밀면 밀면
  - 파일: `public/images/restaurant/thumbnail/450-verified-20261118.webp`

- **바오하우스 (ID 107)**: 부산 부산진구 서전로38번길 62-9 1층, 0507-1324-1031
  - [사진 확인 출처](https://www.diningcode.com/profile.php?rid=loEjHpQf1ZL7) · 바오하우스 바오와 마파두부 등 음식
  - 파일: `public/images/restaurant/thumbnail/107-verified-20261118.webp`

사진은 해당 주소의 지점 페이지에서 음식 사진을 확인한 원본 300×300 WebP이며 외부 서버 없이 표시됩니다. 새 식당의 확인되지 않은 이용 인원·시간대 태그는 추정하지 않았습니다. 기존 메뉴는 보존하고 확인한 메뉴만 추가했습니다.

## 검증

- DB 복사본에서 신규 3곳과 기존 2곳 수정, 재실행 시 변경 0건 확인.
- 실제 반영 전 원본 DB와 SQL 백업 생성. 기존 후기·댓글·사진 연결·회원·북마크는 개수와 내용 해시로 보존 확인.
- localhost / Vercel 빌드에서 1440px·390px 화면 각각 5곳의 검색 결과 및 사진 로드 확인(총 20건).
- 대표 사진은 비율을 유지하며 표시되고 가로 화면 넘침 없음.
- Front 55개, Vercel 체험판 45개 테스트 통과 및 두 환경의 프로덕션 빌드 성공.
- localhost 앱 파일 3,736개와 포함 런타임 434개 무결성 검증 통과.

## DB 재현 도구 (Server)

`RegisterReviewedRestaurants.java`는 서버를 정상 종료하고 백업한 뒤 운영자가 실행하는 도구입니다. `MAINTENANCE_DATABASE_URL`, `MAINTENANCE_DB_USERNAME`, `MAINTENANCE_DB_PASSWORD` 환경 변수로 대상 DB를 지정하고, Jackson/H2가 포함된 서버 라이브러리를 클래스 경로에 넣어 실행합니다.

입력은 `docs/restaurants-20261118.json`, 두 번째 인수는 결과 JSON 경로입니다. 기존 ID 107·128의 상호·주소를 검증하고, 새 식당은 DB에서 ID를 할당합니다. 이 DB에서 신규 ID는 448·449·450입니다. 다른 DB에서는 생성된 ID에 맞춰 Front의 사진 매핑도 대조해야 합니다. 식당 생성·수정 이력을 남기며 전체 작업을 하나의 트랜잭션으로 처리합니다. 기존 회원·후기·댓글을 내보내는 도구는 아닙니다.
