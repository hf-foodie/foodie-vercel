# Front 의존성 보안 점검 — 2026-11-15

## 결론과 변경

이전 푸시에서 표시된 보안 경고는 갱신 전 의존성 정보에 대한 결과였습니다. GitHub Dependabot API의 열린 경고는 0건이며, 해결된 경고 전체 130건의 영향 버전 범위를 현재 package-lock.json의 모든 중첩 설치 경로와 대조한 결과 일치하는 취약 버전은 0건입니다. Next.js 등 기존 패치가 직전 커밋 51893bf에 반영되어 해결 처리됐습니다. 이번에는 추가 버전 변경이나 경고 강제 해제 없이 실제 배포 여부와 회귀 영향을 검증했습니다.

- 전체 의존성 npm audit: 0건(운영·개발 포함).
- standalone 배포 파일의 이름·버전이 명시된 패키지 31개: 기존 경고 영향 범위와 일치 0건. 번들에 합쳐진 라이브러리는 잠금 파일 대조로 보완했습니다.
- npm run security:check를 추가하고 GitHub CI의 npm ci 다음에 실행합니다. 낮음 이상 취약점 또는 검사 실패 시 CI가 실패합니다.
- 이 검사는 인터넷이 되는 개발/CI 환경 전용입니다. 운영 시작·백업·패키징에는 npm 감사나 외부 조회를 추가하지 않았습니다.

GitHub 실행 중 린트 기준의 진단 메시지에 개발 PC 절대 경로가 들어 있어 기존 오류를 신규 오류로 오인하는 문제를 발견했습니다. 진단의 경로만 저장소 상대 경로로 정규화하고, 기존 오류 41개의 기준·진단 내용·소스·발생 위치는 유지했습니다. Windows 로컬/CI와 POSIX 경로의 동등성 및 다른 오류 구분을 테스트했습니다.

현재 알려진 경고에 대한 검사이며, 모든 종류의 취약점이 없음을 보장하는 결과는 아닙니다.

## 실제 영향 판단

Next.js는 실제 HTTP 요청을 처리하므로 사내망에서도 패치를 유지해야 합니다. 현재 빌드와 배포본은 16.4.6입니다. [Next.js 공식 권고 GHSA-673q-mjm6-r5xr](https://github.com/vercel/next.js/security/advisories/GHSA-673q-mjm6-r5xr)의 수정 버전 16.4.1 이상입니다. 해당 권고의 Cache Components/use cache 조건도 현재 소스에서 발견되지 않았지만, 이를 패치의 대체 근거로 삼지 않았습니다.

이미지 처리(sharp 0.35.5, image-size 2.1.0), 편집기(@tiptap/core 3.33.1), lodash 4.18.1도 현재 경고 범위를 벗어납니다. 이미지 업로드·잘못된 이미지 거부·사진 조회는 별도 복사본에서 재검증했습니다.

postcss-selector-parser는 6.1.6으로 고정되어 있습니다. [공식 권고 GHSA-rj75-hqrm-r3gf](https://github.com/postcss/postcss-selector-parser/security/advisories/GHSA-rj75-hqrm-r3gf)는 신뢰할 수 없는 선택자 파싱의 CPU 소진 문제이며, 6.1.5 이상에서 수정됐습니다. 이 앱에는 사용자 CSS 선택자를 이 라이브러리로 처리하는 요청 경로가 없고 빌드 용도로 사용합니다. 개발 도구의 의존성도 감사 대상에 유지했습니다.

## 해결된 경고와 현재 설치 버전

경고 수는 GitHub의 manifest별 경고 수이며 고유 CVE 개수와 다릅니다. 모든 경고의 개별 영향 범위를 비교했으며 최저 수정 버전 하나만으로 판정하지 않았습니다.

| 패키지 | 현재 잠금 파일 버전 | 해결 경고 수 | 대조 결과 |
| --- | --- | ---: | --- |
| zod | 4.6.7 | 1 | 영향 범위 일치 없음 |
| postcss-selector-parser | 6.1.6 | 1 | 영향 범위 일치 없음 |
| next | 16.4.6 | 76 | 영향 범위 일치 없음 |
| brace-expansion | 1.1.22, 5.0.13 | 8 | 영향 범위 일치 없음 |
| source-map-js | 1.2.2 | 1 | 영향 범위 일치 없음 |
| image-size | 2.1.0 | 4 | 영향 범위 일치 없음 |
| sharp | 0.35.5 | 3 | 영향 범위 일치 없음 |
| baseline-browser-mapping | 2.11.36 | 1 | 영향 범위 일치 없음 |
| @tiptap/core | 3.33.1 | 2 | 영향 범위 일치 없음 |
| browserslist | 4.29.5 | 2 | 영향 범위 일치 없음 |
| @humanfs/node | 0.16.8 | 1 | 영향 범위 일치 없음 |
| nanoid | 3.3.20 | 2 | 영향 범위 일치 없음 |
| postcss | 8.5.23, 8.5.32 | 6 | 영향 범위 일치 없음 |
| js-yaml | 4.3.2 | 1 | 영향 범위 일치 없음 |
| linkify-it | 현재 의존성에서 제거됨 | 1 | 영향 범위 일치 없음 |
| @babel/core | 7.29.13 | 1 | 영향 범위 일치 없음 |
| markdown-it | 현재 의존성에서 제거됨 | 2 | 영향 범위 일치 없음 |
| js-cookie | 3.0.8 | 1 | 영향 범위 일치 없음 |
| lodash | 4.18.1 | 2 | 영향 범위 일치 없음 |
| picomatch | 4.0.7, 2.3.2 | 4 | 영향 범위 일치 없음 |
| flatted | 3.4.4 | 2 | 영향 범위 일치 없음 |
| immutable | 5.1.10 | 1 | 영향 범위 일치 없음 |
| minimatch | 11.0.8, 3.1.5 | 6 | 영향 범위 일치 없음 |
| ajv | 6.15.0 | 1 | 영향 범위 일치 없음 |

## 회귀·사내망 실행 검증

- 단위 테스트 32개 통과(기존 기능 30개와 경로 독립 린트 검사 2개), 타입 검사 통과, 기존 린트 기준 대비 새 오류 없음.
- 운영 빌드 성공, 배포 파일 3,165개 SHA-256 기록 및 재검증 통과.
- 검증 시각: 2026-11-15T05:08:55.022Z. 운영 DB와 분리한 복사본, 웹 3149/API 8199 사용.
- Three roles log in through same-origin cookie proxy: 통과.
- Restaurant name/menu search and 380-record snapshot: 통과.
- Bookmark save/search/pagination/remove and anonymous rejection: 통과.
- PNG upload, byte hash, private preview, invalid-file rejection, post attachment and public image read: 통과.
- Manager/admin management reads, edit/save/restore, admin analytics, role denial: 통과.
- Logout invalidates current device session: 통과.
- Node 외부 소켓 차단과 JVM 외부 HTTP/SOCKS 프록시 거부를 적용하고 음성 대조군에서 외부 연결 실패를 확인했습니다. 서버 내부 루프백 통신은 허용했습니다.
- 실제 네트워크 장비를 차단한 시험은 아닙니다. 대상 사내 DNS·방화벽·브라우저 정책은 설치 체크리스트로 최종 확인하세요.
- 테스트 계정과 작성한 후기·업로드는 검증 DB에만 존재합니다. 반입 패키지는 실제 운영 DB·업로드에서 새로 생성합니다.

## 운영 패키지와 재점검

검증된 새 빌드를 반영한 뒤 07-create-transfer.cmd로 정상 종료 → 최신 DB/사진 백업·복사 → 전체 ZIP 파일 해시 비교 → localhost 재시작을 수행합니다. 해당 생성 건의 RESULT.json이 COMPLETE인지, 동봉 SHA-256과 ZIP이 일치하는지 확인하세요. 자동 실행·예약 작업은 제외하며 매일 08-daily-backup.cmd를 직접 실행합니다.

개발 환경 재점검: npm ci → npm run security:check → npm test → npm run typecheck → npm run lint:check → npm run build. 감사 결과를 무시하거나 npm audit fix --force로 주요 버전을 무조건 올리지 말고 영향 범위·호환성·사내망 실행을 다시 확인하세요.
