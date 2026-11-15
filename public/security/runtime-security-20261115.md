# Java·Node.js 보안 업데이트와 지원 상태 — 2026-11-15

## 적용 버전

| 런타임 | 기존 운영 패키지 | 적용한 공식 Windows x64 배포본 |
| --- | --- | --- |
| Oracle JDK 25 LTS | 25.0.4.1 | 25.0.5.0.3+1-LTS-2 |
| Node.js 24 LTS | 24.21.0 | 24.22.3 |

기존 공급자와 메이저 버전을 유지한 보안 업데이트입니다. 운영 설정의 JavaPath·NodePath는 패키지 자체의 runtimes/java/bin/java.exe와 runtimes/node/node.exe를 사용합니다. 앱·DB 스키마의 업무 동작을 변경하지 않습니다. 시스템 전역 실행 경로를 사용하는 개발 작업은 아래 검증 버전을 명시해 실행하세요.

## 보안 공지와 실제 영향 판단

[Oracle 2026년 10월 CPU](https://www.oracle.com/security-alerts/cpuoct2026.html)는 기존 25.0.4.1을 여러 취약점의 영향 버전으로 명시합니다. 업로드 처리에서 실제 사용하는 ImageIO를 포함해 네트워킹·보안 구성요소가 대상입니다. 특정 공격의 재현 가능성을 단정하지 않고 공식 보안 기준 이상으로 갱신했습니다. [Oracle JDK 25 릴리스 노트](https://www.oracle.com/java/technologies/javase/25all-relnotes.html)의 최신 GA와 보안 기준은 25.0.5.0.3입니다.

[Node.js 24.22.3 공식 릴리스](https://nodejs.org/en/blog/release/v24.22.3)는 보안 릴리스이며 HTTP/2·TLS·HTTP 처리와 내장 라이브러리 수정을 포함합니다. [11월 보안 공지](https://nodejs.org/en/blog/vulnerability/november-2026-security-releases)의 일부 HTTP/2·TLS 취약점은 현재 HTTP/1.1 운영 설정에서 직접 사용되지 않지만, 내장 라이브러리와 향후 HTTPS 운영을 포함해 지원되는 패치 버전으로 갱신했습니다. 외부 인터넷 차단을 보안 업데이트의 대체 수단으로 취급하지 않습니다.

## 지원·다음 점검

- [Node.js 공식 일정](https://github.com/nodejs/Release/blob/main/schedule.json): 24 계열은 2026-10-20부터 Maintenance LTS, 지원 종료는 2028-04-30입니다. 현재 지원 중이므로 26으로 메이저 업그레이드하지 않았습니다.
- [Oracle 지원 로드맵](https://www.oracle.com/java/technologies/java-se-support-roadmap.html): Java 25 LTS의 Premier Support는 2030년 9월, Extended Support는 2033년 9월까지이며 상용 지원 계약과 구분해야 합니다.
- [Oracle 다운로드 안내](https://www.oracle.com/java/technologies/downloads/#java25): JDK 25의 NFTC 조건 업데이트 제공 기간은 2028년 9월까지입니다. 동봉된 LICENSE·legal 문서를 함께 보관합니다.
- Oracle 릴리스 노트의 **다음 보안 업데이트 예정일은 2026-11-17**입니다. 이번 반입 버전은 11월 15일 확인 기준이며, 11월 17일 이후 실제 공개된 패치를 다시 점검해야 합니다. 예정일이 도래해도 자동 종료·자동 다운로드하지 않습니다.

## 출처·무결성

공식 ZIP과 공급자 체크섬을 HTTPS로 받아 SHA-256을 비교한 뒤 실행 파일의 Authenticode가 Valid인지 확인했습니다. 서명자는 Oracle America, Inc.와 OpenJS Foundation입니다. 원본 다운로드 정보는 tools/runtime-release.json에 저장합니다.

- Oracle ZIP SHA-256: AC55FD9B11DBD179075DD6F8D2D3A010408145A4443293480BFE187414E73219
- Node ZIP SHA-256: E612AF99F626AB415EA225AF6BCE5C971FEB448CB5CAE250BB1C3FA50C5F7D9F

Oracle latest URL은 향후 파일이 바뀔 수 있으므로 재다운로드 시 현재 체크섬·서명·실제 버전을 다시 확인해야 합니다. 패키지에는 Java의 LICENSE·legal, Node의 LICENSE와 전체 런타임 파일별 SHA-256 manifest를 포함합니다.

## 운영 전 검사와 재발 방지

02-check.cmd와 서버 시작 시 인터넷 조회 없이 tools/runtime-policy.json의 승인 기준을 검사합니다. Node 24.22.3 이상인 24 계열, Java 25.0.5.0.3 이상인 25 계열의 정식 버전만 허용합니다. 이는 이 프로젝트에서 검증한 배포 기준이며 다른 공급자의 동등한 보안 패치 여부를 일반화한 기준은 아닙니다. 공급자를 바꾸려면 별도 검증 후 기준을 갱신하세요.

구버전·시험판·다른 메이저 버전은 실패 처리하고, 숫자로 버전을 비교해 24.100 같은 버전도 올바르게 판단합니다. 이 기준은 새로 발표되는 취약점을 자동으로 검색하는 기능이 아니므로 정기적인 공지 확인이 필요합니다. Front CI는 Node 24.22.3을 사용하고 package.json/lockfile의 Node 최소 버전도 맞췄습니다. Foodie CI는 Windows PowerShell 5와 PowerShell 7에서 버전 정책을 검사합니다.

## 수행한 검증

- 새 Oracle JDK에서 오프라인 Server test·bootJar 재실행: 96개 테스트 통과, 실패·오류 0건.
- 새 Node에서 Front 테스트 32개, 타입·린트 검사와 운영 빌드 통과.
- 최소 버전 경계·낮은 패치·다른 메이저·시험판·잘못된 문자열 등 정책 테스트 12개 통과.
- 별도 DB 복사본과 포트 3149/8199에서 새 런타임으로 실행한 결과(2026-11-15T06:31:16.713Z):
- Three roles log in through same-origin cookie proxy: 통과.
- Restaurant name/menu search and 380-record snapshot: 통과.
- Bookmark save/search/pagination/remove and anonymous rejection: 통과.
- PNG upload, byte hash, private preview, invalid-file rejection, post attachment and public image read: 통과.
- Manager/admin management reads, edit/save/restore, admin analytics, role denial: 통과.
- Logout invalidates current device session: 통과.
- 외부 Node 소켓을 제한하고 JVM 외부 HTTP/SOCKS를 연결 거부 프록시로 보냈으며 대조군의 외부 연결 실패를 확인했습니다. 실제 사내 방화벽 전체를 차단한 시험은 아닙니다.
- 새 Java에서 일일 백업·재시작, 최근 30개 보관 통과. 생성한 SQL ZIP을 별도 빈 DB로 복구해 식당·회원·후기·업로드 건수 일치를 확인했습니다.
- 검증용 데이터는 운영 DB에 넣지 않았습니다. 최종 패키지는 실제 운영 DB와 사진으로 다시 생성하며 RESULT.json COMPLETE 및 ZIP·동봉 SHA-256을 확인합니다.

## 설치·업데이트·복구

사내망에서는 새 패키지 전체를 최종 경로에 압축 해제하고 관리자 권한으로 00-relocate → 01-settings → 02-check → 03-start → 04-status 순서로 실행합니다. Java·Node를 추가 다운로드하지 않습니다. 수동 일일 백업은 08-daily-backup.cmd이며 예약 작업은 설치하지 않습니다.

추후 업데이트는 인터넷이 가능한 준비 환경에서 공급자의 정식 배포본·체크섬·서명을 확인하고 복사본 기능/백업/복구를 시험한 뒤 진행합니다. 실행 중인 파일에 덮어쓰지 말고 정상 종료한 후 교체합니다. 런타임 manifest를 단순 재생성하여 출처 검증을 생략하지 마세요. 기존 실행 파일·설정·같은 시점 DB/사진을 보존하고 실패 시 검증된 전체 조합으로 복구합니다. 보안 기준보다 오래된 런타임으로 돌아가는 경우를 정상 업데이트로 취급하지 않습니다.
