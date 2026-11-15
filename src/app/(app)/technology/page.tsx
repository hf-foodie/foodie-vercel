import { Breadcrumb } from '@/components/krds/PageHeading'
import type { Metadata } from 'next'
import Link from 'next/link'
import inventory from '../../../../public/security/inventory.json'
import sbom from '../../../../public/security/sbom.cdx.json'
import Inventory from './Inventory'
import styles from '../help/page.module.css'

export const metadata: Metadata = { title: '기술과 운영 · SBOM 및 보안 점검', description: '오늘뭐먹지의 의존성 버전, SBOM, 보안 검사 근거와 사내망 운영 확인 사항' }
export default function TechnologyPage() {
  const version = (name: string) => sbom.components.find(component => component['bom-ref'] === `npm:node_modules/${name}`)?.version ?? inventory.rows.find(row => row.name === name)?.version ?? 'SBOM 확인'
  return <main className={`kr-container kr-main ${styles.page}`}>
    <Breadcrumb current="기술과 운영" />
    <header className={styles.note}><p className={styles.eyebrow}>오늘뭐먹지 · 정보보안 검토 자료</p><h1 style={{ fontSize: 36, fontWeight: 800 }}>기술과 운영</h1><p>실제 구성 버전과 보안 검사 범위, 외부 연결 없이 동작하는 구조를 확인합니다.</p><p>자료 생성: {inventory.generatedAt} · 실시간 진단 화면이 아닌 배포 시점의 점검 자료입니다.</p></header>
    <nav className={styles.contents} aria-label="기술과 운영 목차"><a href="#architecture">기술 스택 및 아키텍처</a><a href="#security">보안 점검</a><a href="#network">사내망과 통신</a><a href="#sbom">라이브러리·SBOM</a><a href="#operations">운영 점검</a><Link href="/help">시작하기</Link></nav>
    <section id="architecture" className={styles.section} aria-labelledby="architecture-title">
      <h2 id="architecture-title">기술 스택 및 아키텍처</h2>
      <p className={styles.intro}>화면과 서버 API, 데이터 저장소를 한 Windows 서버에 배포합니다. 아래 버전은 이 페이지에 동봉된 SBOM에서 가져옵니다.</p>
      <dl className={styles.stack}>
        <div><dt>화면·웹 서버</dt><dd>React {version('react')} · Next.js {version('next')} · TypeScript {version('typescript')} · Node.js {version('Node.js')}</dd></div>
        <div><dt>업무 API·인증</dt><dd>Spring Boot {version('org.springframework.boot:spring-boot')} · Spring Security {version('org.springframework.security:spring-security-core')} · JJWT {version('io.jsonwebtoken:jjwt-api')} · Oracle JDK {version('Oracle JDK')}</dd></div>
        <div><dt>데이터 접근·저장</dt><dd>Hibernate ORM {version('org.hibernate.orm:hibernate-core')} · H2 {version('com.h2database:h2')} · 서버 로컬 사진 저장소</dd></div>
        <div><dt>화면 구성·배포</dt><dd>KRDS 확장형 반응형 UI · 로컬 사진·글꼴 · Java·Node 동봉 Windows 패키지 · 수동 실행·일일 백업</dd></div>
      </dl>
      <figure className={styles.note} aria-labelledby="architecture-caption">
        <figcaption id="architecture-caption"><strong>요청과 데이터 흐름</strong></figcaption>
        <ol className={styles.grid} style={{ listStyle: 'none', padding: 0 }}>
          <li className={styles.card}><span className={styles.number}>01 · 사용자 단말 → 웹</span><h3>사내 브라우저</h3><p>내부 서비스 주소로 접속합니다. 화면·사진·글꼴과 SBOM은 같은 서비스에서 제공합니다.</p></li>
          <li className={styles.card}><span className={styles.number}>02 · 웹 → API</span><h3>Next.js / Node.js</h3><p>화면을 렌더링하고 같은 출처의 API 프록시로 요청을 전달합니다. 로그인 쿠키와 토큰 갱신은 웹 계층에서 처리합니다.</p></li>
          <li className={styles.card}><span className={styles.number}>03 · API → 저장소</span><h3>Spring Boot / Java</h3><p>회원·매니저·관리자 권한과 입력을 검증하고 식당·후기·북마크·추천·통계 업무를 처리합니다.</p></li>
          <li className={styles.card}><span className={styles.number}>04 · 저장소 → 백업</span><h3>H2 DB · 사진 · 백업</h3><p>DB는 파일 기반이며 업로드는 서버 로컬에 저장합니다. SQL 백업과 사진은 함께 보존하고 이전 패키지에서 무결성을 확인합니다.</p></li>
        </ol>
        <p>운영 흐름: 브라우저 → 내부 웹 → 같은 서버의 API → 로컬 저장소. 준비 흐름: 인터넷 준비 환경에서 빌드·보안 점검 → 승인된 반입 → 사내 운영. 외부 준비 환경은 운영 요청의 필수 경로가 아닙니다.</p>
      </figure>
      <p className={styles.caption}>논리 구성도입니다. 실제 서버·방화벽·DNS·HTTPS 설정은 배치 환경에서 확인해야 합니다. 현재 localhost 검증은 HTTP를 사용하며, 기관 망분리 인증을 의미하지 않습니다.</p>
    </section>
    <section id="security" className={styles.section}><h2>보안 점검 결과와 범위</h2>
      <div className={styles.grid}>
        <article className={styles.card}><h3>Front · npm audit</h3><strong>알려진 경고 {inventory.npm.vulnerabilities.total}건</strong><p>검사: {inventory.npm.checkedAt}</p><p>운영·개발 의존성 포함. npm 권고 데이터베이스 기준입니다.</p></article>
        <article className={styles.card}><h3>Server · OSV</h3><strong>알려진 경고 {inventory.server.findings.length}건</strong><p>검사: {inventory.server.checkedAt}</p><p>잠금 파일과 실행 JAR의 {inventory.server.auditedCount}개 좌표·버전 조회. 실제 JAR 라이브러리 {inventory.server.packagedCount}개 포함.</p></article>
      </div>
      <div className={styles.note}><strong>경고 0건은 보안 인증이나 취약점 부재를 보증하지 않습니다.</strong><p>신규 권고, 업무 로직, OS, 설정, 중첩 번들·네이티브 구성은 별도 검토가 필요합니다.<br />사내망도 내부 사용자 입력과 파일을 처리하므로 보안 업데이트를 유지합니다.<br />라이브 조회는 운영 페이지에서 실행하지 않습니다.</p></div>
      <p className={styles.intro}>Java 25.0.5.0.3 · Node.js 24.22.3은 2026-11-15 런타임 점검 기록의 배포 버전입니다.<br />Java의 다음 검토 예정일은 2026-11-17입니다. 이 화면은 런타임 CVE 전체를 실시간 스캔하지 않습니다.</p>
      <div className={styles.actions}><a className="kr-link" href="/security/dependency-security-20261115.md" download>Front 점검 근거</a><a className="kr-link" href="/security/server-security-20261115.md" download>Server 점검 근거</a><a className="kr-link" href="/security/runtime-security-20261115.md" download>런타임 점검 근거</a></div>
    </section>
    <section id="network" className={styles.section}><h2>사내망 실행과 망분리 확인</h2>
      <div className={styles.note}><strong>외부 인터넷 없이 실행 가능 · 기관 망분리 인증은 별도 확인</strong><p>검증 환경에서 Node 외부 소켓 제한과 JVM 외부 HTTP/SOCKS 연결 거부를 적용하고 로그인·검색·북마크·업로드·관리·백업을 확인했습니다.<br />이는 OS 전체 방화벽 차단 시험이나 실제 기관 망분리 승인 결과가 아닙니다.</p></div>
      <div className={styles.grid}><article className={styles.card}><h3>운영 통신 흐름</h3><p>사용자 브라우저 → 내부 웹 서버 → 같은 서버의 API → 로컬 H2·사진 저장소.</p><p>사진·글꼴·실행 파일을 함께 배포합니다.<br />네이버 조회, CDN, 보안 권고 조회는 필수 운영 경로가 아닙니다.</p></article><article className={styles.card}><h3>준비 환경과 운영 환경</h3><p>외부 자료 조사·라이브러리 다운로드·취약점 검사는 인터넷이 가능한 준비 환경에서 수행합니다. 검증한 패키지를 승인된 절차로 내부에 반입합니다.</p><p>이 화면의 검색·SBOM 다운로드도 내부 파일만 이용합니다.</p></article></div>
      <details className={styles.details}><summary>정보보안 담당자 현장 확인 체크리스트</summary><ol><li>운영 서버와 사용자 단말의 외부 송신 차단, 프록시·DNS 우회 경로를 확인합니다.</li><li>API·DB 관리 포트가 사용자망 또는 외부에 직접 노출되지 않는지 확인합니다.</li><li>내부 DNS·인증서·HTTPS를 적용합니다. 현재 localhost 검증 구성은 HTTP이며 전송 암호화를 제공하지 않습니다.</li><li>방화벽 정책과 통신 로그로 승인된 내부 경로만 사용하는지 확인합니다.</li><li>외부 연결 차단 상태에서 로그인·검색·사진·업로드·관리·백업·복구를 재검증하고 기관 승인 기록을 보관합니다.</li></ol></details>
    </section>
    <section id="sbom" className={styles.section}><h2>라이브러리 버전과 SBOM</h2><p className={styles.intro}>npm 잠금 파일의 전이·개발·선택 플랫폼 구성, Gradle 잠금 파일과 운영 JAR, Java·Node 실행 파일을 수록했습니다. 잠금 파일 항목 모두가 운영에 배포되는 것은 아닙니다. 동일 이름·버전도 설치 경로가 다르면 별도 항목입니다.</p>
      <p>직접·전이 관계 그래프, OS 패키지, 내장·재패키징 코드, 런타임 내부 네이티브 라이브러리 전체는 포함하지 않습니다. 라이선스 미확인은 사용 허가를 의미하지 않습니다. JDK·Node 해시는 실행 파일 기준입니다.</p>
      <div className={styles.actions}><a className="kr-button kr-button-primary" href="/security/sbom.cdx.json" download>CycloneDX 1.6 JSON 다운로드</a><a className="kr-button" href="/security/inventory.json" download>목록·검사 요약 다운로드</a></div>
      <details className={styles.details}><summary>자료 무결성 SHA-256</summary><p style={{ overflowWrap: 'anywhere' }}>SBOM: {inventory.sbomSha256}<br />Front 잠금 파일: {inventory.packageLockSha256}<br />Server 실행 JAR: {inventory.serverJarSha256}</p></details>
      <Inventory rows={inventory.rows} />
    </section>
    <section id="operations" className={styles.section}><h2>운영과 보안 재점검</h2><div className={styles.grid}><article className={styles.card}><h3>백업·복구</h3><p>일일 백업은 운영자가 직접 실행하고 최근 30개를 보관합니다. SQL 백업과 사진을 함께 보존하고 복구 검증을 수행합니다. 자동 실행·예약 작업은 설치하지 않습니다.</p></article><article className={styles.card}><h3>변경 시 갱신</h3><p>라이브러리·런타임 변경 시 준비 환경에서 감사와 SBOM을 재생성합니다. 보안 담당자는 파일 해시와 검사 시점을 비교하고 실제 반입본을 승인합니다.</p></article></div><p className={styles.intro}>회원·매니저·관리자의 업무 권한과 서버 운영 계정은 구분합니다. 비밀 설정, DB, 회원 정보는 이 공개 안내 자료에 포함하지 않습니다.</p></section>
  </main>
}
