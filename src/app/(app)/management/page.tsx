import Link from 'next/link'
import AdminNavigation from '@/components/krds/AdminNavigation'
import { Breadcrumb, PageHeading } from '@/components/krds/PageHeading'
import { customFetch } from '@/lib/fetch'
import { apiBase } from '@/lib/server-session'
import { managementRole } from '@/lib/managementAccess'
export default async function Page() {
 const role=await managementRole()
 if(!['ADMIN','MANAGER'].includes(role||'')) return null
 const response=await customFetch(apiBase()+'/management/summary')
 if(!response.ok)throw Error('관리 현황을 불러오지 못했습니다.')
 const data=await response.json()
 return <main className="kr-container kr-main kr-admin"><Breadcrumb current="맛집 관리"/><PageHeading title="맛집 관리" description="식당 정보와 추천 연결을 점검하고 처리할 작업을 확인하세요."/><AdminNavigation/>
 <div className="my-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{[['등록 식당',data.restaurants],['등록 후기',data.posts],['수정 제안 대기',data.pendingChanges],['추천 미연결',data.unlinked]].map(([label,value])=><section className="kr-panel" key={label}><h2>{label}</h2><p className="mt-3 text-3xl font-bold">{value}건</p></section>)}</div>
 <section className="kr-panel"><h2 className="text-xl font-bold">추천 식당 ID 연결 점검</h2><ul className="mt-4 space-y-3">{data.links.map((item:{label:string;total:number;missing:number})=><li key={item.label}>{item.label}: {item.total}건 · 연결 대상 누락 {item.missing}건</li>)}</ul><p className="kr-muted mt-4">사장님·부사장님·사내커플 추천은 등록 식당 ID를 직접 참조합니다. 현재 상호·주소를 표시하며, 이번 업데이트부터 보관한 기준 이름과 달라지면 이전 추천명을 표시합니다.</p></section>
 <div className="mt-6 grid gap-4 sm:grid-cols-2"><Link className="kr-panel kr-link" href="/curated-links">흑백요리사·인턴 연결 관리 →</Link><Link className="kr-panel kr-link" href="/restaurant-changes">식당 수정·제안 승인 →</Link><Link className="kr-panel kr-link" href="/recommendations">추천 콘텐츠 편집 →</Link>{role==='ADMIN'&&<Link className="kr-panel kr-link" href="/admin/analytics">관리자 통계 보기 →</Link>}</div>
 </main>
}
