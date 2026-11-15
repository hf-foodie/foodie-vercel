'use client'

import { useState } from 'react'
type Row = { name: string; version: string; ecosystem: string; usage: string; purl: string; license: string }
export default function Inventory({ rows }: { rows: Row[] }) {
  const [query, setQuery] = useState('')
  const [scope, setScope] = useState('전체')
  const [page, setPage] = useState(1)
  const filtered = rows.filter(row => (scope === '전체' || row.ecosystem === scope) && `${row.name} ${row.version} ${row.usage}`.toLowerCase().includes(query.trim().toLowerCase()))
  const pages = Math.max(1, Math.ceil(filtered.length / 20))
  return <div>
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, marginBlock: 20 }}>
      <label>라이브러리 검색<input className="kr-input" style={{ display: 'block', maxWidth: '100%' }} value={query} onChange={e => { setQuery(e.target.value); setPage(1) }} placeholder="이름·버전·용도" /></label>
      <label>구성 구분<select className="kr-input" style={{ display: 'block' }} value={scope} onChange={e => { setScope(e.target.value); setPage(1) }}>{['전체', 'npm', 'Maven', 'Runtime'].map(value => <option key={value}>{value}</option>)}</select></label>
    </div>
    <p role="status">전체 {rows.length}개 중 {filtered.length}개 · {page} / {pages} 페이지</p>
    <div style={{ overflowX: 'auto', marginBlock: 16 }} tabIndex={0} role="region" aria-label="SBOM 라이브러리 목록, 좁은 화면에서는 좌우로 이동">
      <table style={{ width: '100%', minWidth: 720, borderCollapse: 'collapse' }}>
        <caption style={{ textAlign: 'left', padding: 12 }}>잠금 파일·실행 JAR·운영 런타임 구성 목록</caption>
        <thead><tr>{['라이브러리 / 식별자', '버전', '구분', '포함 범위', '라이선스'].map(x => <th key={x} scope="col" style={{ textAlign: 'left', padding: 12, borderBottom: '2px solid var(--kr-border)' }}>{x}</th>)}</tr></thead>
        <tbody>{filtered.slice((page - 1) * 20, page * 20).map((row, i) => <tr key={`${row.name}:${row.version}:${i}`}>
          <th scope="row" style={{ padding: 12, textAlign: 'left', overflowWrap: 'anywhere', maxWidth: 300 }}>{row.name}<small style={{ display: 'block', fontWeight: 400 }}>{row.purl}</small></th>
          {[row.version, row.ecosystem, row.usage, row.license].map((value, index) => <td key={index} style={{ padding: 12, borderBottom: '1px solid var(--kr-border)' }}>{value}</td>)}
        </tr>)}</tbody>
      </table>
    </div>
    {!filtered.length && <p>일치하는 라이브러리가 없습니다.</p>}
    <nav aria-label="SBOM 페이지 이동" style={{ display: 'flex', gap: 12 }}><button className="kr-button" disabled={page <= 1} onClick={() => setPage(page - 1)}>이전</button><button className="kr-button" disabled={page >= pages} onClick={() => setPage(page + 1)}>다음</button></nav>
  </div>
}
