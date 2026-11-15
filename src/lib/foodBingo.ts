export const BINGO_KEY = 'todaymeal.bingo.v1'
export const missions = [
  { id: 'first', title: '처음 가본 식당', icon: '🌱', description: '내가 처음 방문한 등록 식당에서 한 끼 먹기. 첫 방문 여부는 직접 확인해 주세요.' },
  { id: 'soup', title: '따뜻한 국밥', icon: '🍲', description: '대표 메뉴에 국밥이 등록된 식당에서 국밥 먹기.' },
  { id: 'noodle', title: '면 요리', icon: '🍜', description: '대표 메뉴에 면 요리가 등록된 식당에서 면 요리 먹기.' },
  { id: 'colleague', title: '동료 추천 맛집', icon: '💬', description: '동료에게 추천받은 등록 식당 방문하기. 아래 목록은 전체 식당이며 추천 여부는 직접 확인해 주세요.' },
  { id: 'korean', title: '한식 한 끼', icon: '🍚', description: '한식으로 등록된 식당에서 한 끼 먹기.' },
  { id: 'solo', title: '혼밥하기', icon: '🥢', description: '혼밥 가능으로 등록된 식당에서 혼자 식사하기.' },
  { id: 'region', title: '다른 지역 맛집', icon: '🧭', description: '기준 지역을 고른 뒤, 다른 시·도의 등록 식당 방문하기.' },
  { id: 'revisit', title: '오랜만에 재방문', icon: '👣', description: '예전에 갔던 등록 식당을 다시 방문하기. 방문 이력을 자동 확인하지 않습니다.' },
  { id: 'newmenu', title: '새로운 메뉴 도전', icon: '✨', description: '등록 식당에서 내가 먹어보지 않은 메뉴에 도전하기.' },
] as const
export type MissionId = typeof missions[number]['id']
export type BingoState = { version: 1; order: MissionId[]; checked: MissionId[]; region: string }
export type BingoRestaurant = { restaurantId: number; name: string; address: string; category: string; isSolo: boolean; representativeMenuNames: string[] }
const ids = missions.map(m => m.id)
export function readBingoView(params: { get(key: string): string | null }) {
  const mission = params.get('mission') as MissionId
  const rawPage = Number(params.get('page'))
  const rawRegion = params.get('region')
  return {
    mission: ids.includes(mission) ? mission : 'first' as MissionId,
    page: Number.isSafeInteger(rawPage) && rawPage > 0 ? rawPage - 1 : 0,
    region: rawRegion === null ? null : restaurantRegion(rawRegion),
  }
}
export function newBingo(random = Math.random): BingoState {
  const order = [...ids]
  for (let i = order.length - 1; i > 0; i--) { const j = Math.floor(random() * (i + 1)); [order[i], order[j]] = [order[j], order[i]] }
  return { version: 1, order, checked: [], region: '' }
}
export function readBingo(raw: string | null): BingoState | null {
  if (!raw) return null
  try {
    const s = JSON.parse(raw)
    if (s?.version !== 1 || !Array.isArray(s.order) || s.order.length !== 9 || new Set(s.order).size !== 9 || !s.order.every((id: MissionId) => ids.includes(id)) || !Array.isArray(s.checked) || s.checked.length > 9 || new Set(s.checked).size !== s.checked.length || !s.checked.every((id: MissionId) => ids.includes(id)) || typeof s.region !== 'string' || s.region.length > 30) return null
    return { version: 1, order: s.order, checked: s.checked, region: s.region }
  } catch { return null }
}
export function toggleMission(s: BingoState, id: MissionId): BingoState {
  if (!ids.includes(id)) return s
  return { ...s, checked: s.checked.includes(id) ? s.checked.filter(x => x !== id) : [...s.checked, id] }
}
export function bingoLines(s: BingoState): number {
  return [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]].filter(line => line.every(i => s.checked.includes(s.order[i]))).length
}
export function restaurantRegion(address: string): string {
  const first = address.trim().split(/\s+/)[0] || ''
  const aliases: Record<string,string> = { 부산광역시: '부산', 서울특별시: '서울', 대구광역시: '대구', 인천광역시: '인천', 광주광역시: '광주', 대전광역시: '대전', 울산광역시: '울산', 세종특별자치시: '세종', 경기도: '경기', 강원도: '강원', 강원특별자치도: '강원', 충청북도: '충북', 충청남도: '충남', 전라북도: '전북', 전북특별자치도: '전북', 전라남도: '전남', 경상북도: '경북', 경상남도: '경남', 제주도: '제주', 제주특별자치도: '제주' }
  const normalized = aliases[first] || first
  return ['서울','부산','대구','인천','광주','대전','울산','세종','경기','강원','충북','충남','전북','전남','경북','경남','제주'].includes(normalized) ? normalized : ''
}
export function missionRestaurants(rows: BingoRestaurant[], id: MissionId, region: string): BingoRestaurant[] {
  return rows.filter(r => {
    const menus = r.representativeMenuNames.join(' ').replace(/\s+/g, '')
    if (id === 'soup') return /국밥|순댓국|순대국/.test(menus)
    if (id === 'noodle') return /국수|냉면|밀면|우동|라멘|소바|짜장|자장|짬뽕|파스타|스파게티/.test(menus)
    if (id === 'korean') return r.category.includes('한식')
    if (id === 'solo') return r.isSolo === true
    if (id === 'region') return !!region && !!restaurantRegion(r.address) && restaurantRegion(r.address) !== region
    return true
  })
}

