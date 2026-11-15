# 기술과 운영 화면 / SBOM 갱신

`/technology`는 비밀값을 포함하지 않는 공개 보안 검토 자료입니다. 앱의 외부 연결 제한 시험과 기관의 실제 망분리 승인 여부를 구분합니다. `/help`는 서비스 → 이용 설명서 → 매니저 → 참여 → FAQ 순서입니다.

## 생성 범위

CycloneDX 1.6 구성 목록: Front package-lock.json의 모든 설치 경로(개발·선택 플랫폼 포함), Server Gradle 잠금 좌표 및 실제 운영 JAR 라이브러리, 패키지 Java·Node 실행 파일 버전과 해시. npm 라이선스는 잠금 파일 값을 사용하며 Maven·런타임 라이선스는 미확인으로 표시합니다. 직접·전이 관계 그래프와 내장 네이티브 하위 구성, OS 목록은 완전 수록하지 않습니다. SBOM 자체는 취약점 판정서가 아닙니다.

## 준비 환경에서 갱신

워크스페이스에 front, server, foodie가 나란히 있어야 합니다. 먼저 의존성·서버 빌드·운영 런타임을 확정합니다.

1. 루트에서 `powershell.exe -NoProfile -ExecutionPolicy Bypass -File server/scripts/security-check.ps1 -Jar foodie/app/backend/server.jar -Report foodie/verification/technology-server-audit.json` 실행.
2. Front에서 `npm audit --json` 결과를 UTF-8로 `../foodie/verification/technology-npm-audit.json`에 저장. 명령 실패를 무시하지 말고 경고 결과인지 통신 오류인지 확인.
3. 루트에서 패키지 Node로 `front/scripts/generate-security-inventory.cjs` 실행. 새 감사 결과를 즉시 사용합니다. 이 생성기는 인터넷에 접속하지 않습니다.
4. `front/public/security/`의 JSON과 공개용 점검 문서를 검토. 비밀 설정·운영 경로·개인정보를 추가하지 않습니다.
5. `npm test`, 타입 검사, 린트, 빌드 후 운영 반영. 의존성 변경 후 SBOM을 갱신하지 않으면 잠금 파일 해시 테스트가 실패합니다.
6. `/technology`에서 검색·구분·페이지 이동·JSON 다운로드와 검사 시점을 확인. 최종 사내망 이전 패키지는 별도로 다시 생성합니다.

## 근거와 한계

2026-11-15 npm audit 경고 0건, Maven OSV 128개 좌표 검사 경고 0건, 운영 JAR 80개 라이브러리 확인. 과거 외부 연결 제한 회귀 검사 기록을 함께 제공합니다. 새로 수행하지 않은 실제 기관 방화벽 검사나 런타임 CVE 전체 검사를 통과했다고 표시하지 않습니다. 현재 localhost는 HTTP이며 기관 배포 시 HTTPS와 방화벽·DNS·프록시 설정을 보안 담당자가 별도 확인해야 합니다.
## 기술 스택과 아키텍처 / 반입 확인

기술과 운영의 첫 항목은 기술 스택 및 아키텍처입니다. 표시 버전은 동봉한 SBOM에서 조회합니다. 사내 브라우저 → Next.js 웹·인증 프록시 → Spring Boot 업무 API → H2·로컬 사진·백업 순서의 논리 구성을 제공하며 실제 망분리 인증과 구분합니다.

최신 패키지 반입 시 `/help`의 서비스·이용 설명서·매니저·참여·FAQ 순서와 `/technology` 첫 항목을 확인합니다. `/security/sbom.cdx.json`과 `/security/inventory.json`, 보안 근거 문서 3개가 다운로드되는지 확인합니다. 공개 다운로드는 허용된 파일만 제공하며 임의 파일 경로는 허용하지 않습니다. 최종 ZIP은 DB·사진과 비밀 설정을 포함하므로 GitHub에 올리지 않습니다.
