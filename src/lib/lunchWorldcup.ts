export type MenuRestaurant = { restaurantId: number; name: string; address: string; representativeMenuNames: string[]; nearOfficeNames: string[] }
export const dishes = [
  { id: 'gukbap', name: '국밥', icon: '🍲', pattern: /국밥|순댓국|순대국/ },
  { id: 'jjajang', name: '짜장면', icon: '🍜', pattern: /짜장|자장면/ },
  { id: 'jjamppong', name: '짬뽕', icon: '🍜', pattern: /짬뽕/ },
  { id: 'katsu', name: '돈까스', icon: '🍱', pattern: /돈까스|돈가스|돈카츠|로스카츠|히레카츠/ },
  { id: 'sushi', name: '초밥', icon: '🍣', pattern: /초밥|스시/ },
  { id: 'udon', name: '우동', icon: '🍜', pattern: /우동/ },
  { id: 'soba', name: '소바', icon: '🍜', pattern: /소바|메밀국수/ },
  { id: 'ramen', name: '라멘', icon: '🍜', pattern: /라멘/ },
  { id: 'kalguksu', name: '칼국수', icon: '🍜', pattern: /칼국수/ },
  { id: 'naengmyeon', name: '냉면', icon: '🍜', pattern: /냉면/ },
  { id: 'bibimbap', name: '비빔밥', icon: '🥗', pattern: /비빔밥/ },
  { id: 'kimchi', name: '김치찌개', icon: '🍲', pattern: /김치찌개/ },
  { id: 'doenjang', name: '된장찌개', icon: '🍲', pattern: /된장찌개/ },
  { id: 'sundubu', name: '순두부', icon: '🍲', pattern: /순두부/ },
  { id: 'jeyuk', name: '제육볶음', icon: '🍛', pattern: /제육|돼지불백/ },
  { id: 'bulgogi', name: '불고기', icon: '🥘', pattern: /불고기/ },
  { id: 'galbi', name: '갈비찜', icon: '🥘', pattern: /갈비찜|찜갈비/ },
  { id: 'bossam', name: '보쌈', icon: '🥬', pattern: /보쌈/ },
  { id: 'shabu', name: '샤브샤브', icon: '🥘', pattern: /샤브/ },
  { id: 'pasta', name: '파스타', icon: '🍝', pattern: /파스타|스파게티|봉골레|까르보나라|알리오올리오/ },
  { id: 'pizza', name: '피자', icon: '🍕', pattern: /피자/ },
  { id: 'burger', name: '햄버거', icon: '🍔', pattern: /버거/ },
  { id: 'curry', name: '카레', icon: '🍛', pattern: /카레|커리/ },
  { id: 'tteokbokki', name: '떡볶이', icon: '🌶️', pattern: /떡볶이/ },
  { id: 'pho', name: '쌀국수', icon: '🍜', pattern: /쌀국수/ },
  { id: 'samgyetang', name: '삼계탕', icon: '🍲', pattern: /삼계탕/ },
  { id: 'friedrice', name: '볶음밥', icon: '🍚', pattern: /볶음밥/ },
  { id: 'gimbap', name: '김밥', icon: '🍙', pattern: /김밥/ },
] as const
export type Candidate = { id: string; name: string; icon: string; restaurants: MenuRestaurant[] }
export function readWorldcupView(params: { get(key: string): string | null }) {
  const winner = params.get('winner'), rawPage = Number(params.get('page'))
  return {
    winner: dishes.some(d => d.id === winner) ? winner : null,
    office: (params.get('office') ?? '').trim().slice(0, 100),
    size: params.get('size') === '16' ? 16 : 8,
    page: Number.isSafeInteger(rawPage) && rawPage > 0 ? rawPage - 1 : 0,
  }
}
export function worldcupHref(winner: string | null, office: string, size: number, page = 0) {
  const query = new URLSearchParams({ ...(winner ? { page: String(page + 1), winner } : {}), ...(office ? { office } : {}), size: String(size) })
  return '/game/worldcup?' + query.toString()
}
export function menuCandidates(restaurants: MenuRestaurant[], office = ''): Candidate[] {
  return dishes.map(dish => ({ ...dish, restaurants: restaurants.filter(r => (!office || r.nearOfficeNames.includes(office)) && r.representativeMenuNames.some(menu => dish.pattern.test(menu.replace(/\s+/g, '')))) })).filter(dish => dish.restaurants.length > 0)
}
export type Cup = { round: Candidate[]; winners: Candidate[]; completed: number; size: number; champion?: Candidate }
export function startCup(candidates: Candidate[], size: number, random = Math.random): Cup {
  const shuffled = [...new Map(candidates.map(c => [c.id, c])).values()]
  if (![8, 16].includes(size) || shuffled.length < size) throw new Error('대결할 메뉴가 부족합니다.')
  for (let i = shuffled.length - 1; i > 0; i--) { const j = Math.floor(random() * (i + 1)); [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]] }
  return { round: shuffled.slice(0, size), winners: [], completed: 0, size }
}
export function matchKey(cup: Cup) { return `${cup.round.length}:${cup.winners.length}` }
export function chooseMenu(cup: Cup, id: string, expectedMatch: string): Cup {
  if (cup.champion || expectedMatch !== matchKey(cup)) return cup
  const pair = cup.round.slice(cup.winners.length * 2, cup.winners.length * 2 + 2)
  const chosen = pair.find(c => c.id === id)
  if (!chosen) return cup
  const winners = [...cup.winners, chosen], completed = cup.completed + 1
  if (winners.length === cup.round.length / 2) {
    return winners.length === 1 ? { ...cup, completed, champion: chosen } : { ...cup, completed, round: winners, winners: [] }
  }
  return { ...cup, completed, winners }
}
export function menuReviewsHref(restaurantId: number) {
  return '/blogs?' + new URLSearchParams({ restaurantId: String(restaurantId) })
}
