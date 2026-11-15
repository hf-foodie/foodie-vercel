# Server 의존성 보안 점검 — 2026-11-15

## 결과와 실제 변경

Server 저장소의 Dependabot 경고가 꺼져 있던 것을 확인하고 활성화했습니다. 활성화 후 열린 경고는 0건입니다. GitHub의 의존성 인식 범위만으로 판단하지 않고 Gradle 잠금 파일의 운영·테스트 의존성 127개와 Spring Boot가 패키징 시 추가하는 jarmode 도구 1개, 총 128개 좌표를 OSV에 직접 조회했습니다. 현재 알려진 취약점은 0건입니다.

운영 JAR 내부 라이브러리 80개를 잠금 파일/Boot 버전과 대조했고, 실제 실행하는 압축 해제 파일 310개는 검사한 JAR의 바이트와 모두 일치했습니다. 별도 백업 도구의 H2 JAR도 운영 JAR에 포함된 버전·해시와 같습니다. 이번 오프라인 재빌드 결과의 SHA-256도 기존 운영 JAR와 동일합니다.

- 검사 시각: 2026-11-15T14:58:08.5247060+09:00
- 운영 JAR SHA-256: 0585033DB30435573FA260E56296A15FEE655C9C9158C3C95F64B6D61D2FE0F1
- 의존성 버전·업무 로직·DB 스키마 변경: 없음. 발견된 취약점을 임의로 숨기거나 무시 처리하지 않았습니다.
- 변경: GitHub 경고 활성화, CI 보안 검사와 검사기 회귀 테스트 추가, 최신 운영 가이드 반영.
- README의 과거 예약 백업 설치 안내를 매일 수동 08-daily-backup.cmd 실행 정책으로 수정했습니다.

## 주요 운영 구성과 노출 범위

| 구성 | 사용 버전 | 업무 영향/점검 범위 |
| --- | --- | --- |
| Spring Boot | 4.1.2 | 서버 실행·자동 설정 및 패키징 도구 |
| Spring Framework | 7.0.10 | HTTP 요청·입력 처리·데이터 접근 |
| Spring Security | 7.1.2 | 로그인·역할별 접근 제한 |
| Tomcat Embed | 11.0.27 | 실제 내부 HTTP 요청 수신 |
| H2 | 2.4.240 | 운영 DB와 SQL 백업·복구 도구 |
| Jackson | 2.21.7 / 3.1.7 | JWT 및 요청/응답 JSON 처리; 두 계열 모두 검사 |
| JJWT | 0.13.0 | 로그인 토큰 검증 |
| Hibernate ORM | 7.4.13.Final | 식당·회원·후기 등 DB 처리 |
| Logback | 1.5.38 | 서버 로그 |
| SnakeYAML | 2.6 | 설정 읽기 |

각 구성의 고정 버전과 전이 의존성을 모두 조회했습니다. 사내망도 내부 HTTP 입력·업로드를 받으므로 외부 인터넷 차단을 취약점 면제 근거로 사용하지 않습니다. 검사 범위는 잠금 파일과 실행 JAR의 Maven 라이브러리이며 Windows·JDK 자체와 모든 업무 로직 취약점까지 없음을 보증하는 검사는 아닙니다.

## 자동 보안 검사

인터넷이 가능한 개발/CI 환경에서 빌드 후 실행합니다.

~~~powershell
./gradlew.bat test bootJar --no-daemon
./scripts/test-security-check.ps1
./scripts/security-check.ps1
~~~

security-check.ps1은 [OSV 버전별 일괄 조회 API](https://google.github.io/osv.dev/post-v1-querybatch/)로 패키지 이름과 버전만 전송합니다. 운영 DB·설정·계정·소스코드는 전송하지 않습니다. 결과는 build/reports/security/dependencies.json에 생성됩니다. 다른 JAR은 -Jar, 보고서 경로는 -Report로 지정할 수 있습니다.

- 네트워크 오류, 누락된 응답, 반복 페이지 토큰, 알 수 없는 패키지 파일, Boot와 다른 버전의 자동 포함 도구는 실패 처리합니다.
- 다음 페이지의 취약점도 빠뜨리지 않으며, 발견된 취약점이 하나라도 있으면 CI가 실패합니다.
- 빈 응답을 안전 판정으로 오인하지 않도록 검사기 회귀 테스트 8개 경우를 확인했습니다.
- 별도 양성 대조군으로 사용하지 않는 Log4j 2.14.1을 조회했을 때 경고 8개가 탐지되는 것도 확인했습니다. 이 버전을 프로젝트에 추가하거나 실행하지 않았습니다.
- 보안 조회는 개발/CI 전용입니다. 사내망 서버 시작·백업·패키징 과정에는 인터넷 연결을 추가하지 않았습니다.

## 기존 기능·사내망 실행 검증

- Gradle --offline test bootJar --rerun-tasks: 96개 테스트, 실패·오류·생략 0건. 캐시 결과만 재사용하지 않고 실행했습니다.
- 복사본 검증 시각: 2026-11-15T06:00:03.582Z. 실제 운영 DB와 분리된 웹 3149/API 8199에서 수행했습니다.
- Three roles log in through same-origin cookie proxy: 통과.
- Restaurant name/menu search and 380-record snapshot: 통과.
- Bookmark save/search/pagination/remove and anonymous rejection: 통과.
- PNG upload, byte hash, private preview, invalid-file rejection, post attachment and public image read: 통과.
- Manager/admin management reads, edit/save/restore, admin analytics, role denial: 통과.
- Logout invalidates current device session: 통과.
- 외부 연결 제한 상태의 수동 일일 백업 → SQL ZIP·체크섬 생성·30개 보관 → 서버 재시작 → 정상 종료: 통과.
- Node 외부 소켓 차단과 JVM 외부 HTTP/SOCKS 프록시 거부를 적용했고 외부 접속 대조군 실패를 확인했습니다. OS 방화벽을 완전히 차단한 시험은 아니므로 실제 사내 DNS·방화벽 정책은 대상 서버에서 최종 확인합니다.
- 테스트 회원·후기·업로드는 복사본에만 저장했습니다. 반입 패키지는 실제 운영 DB·사진으로 새로 생성합니다.

## 운영 반입

변경된 보안·관리 가이드를 포함해 07-create-transfer.cmd로 패키지를 재생성합니다. 최신 DB·업로드 복사와 모든 압축 파일의 해시를 확인하고 원본을 재시작한 경우에만 RESULT.json에 COMPLETE를 기록합니다. 최종 ZIP과 .sha256을 함께 반입하고 INSTALL-CHECKLIST.md를 따릅니다. 자동 실행·예약 작업은 제외하고 매일 08-daily-backup.cmd를 직접 실행합니다.
