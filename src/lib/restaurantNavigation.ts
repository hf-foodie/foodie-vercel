type Query = { get(name: string): string | null; getAll(name: string): string[] }
const labels = {
  '/dormitory/gyungdong': '경동파크타워 인근 맛집',
  '/game/bingo': '맛집빙고',
  '/game/worldcup': '맛집월드컵',
  '/search': '맛집탐방', '/records': '맛집 후기',
  '/restaurant/hf': '주금공 맛집', '/restaurant/dubai': '두쫀쿠 맛집', '/blackwhite': '흑백요리사',
  '/influencer/ceo': '사장님의 선택', '/influencer/vpresident': '부사장님의 선택',
  '/influencer/cc': '사내커플 추천', '/influencer/intern': "인턴's Pick",
}
export type RestaurantListPath = keyof typeof labels
export function restaurantListHref(path: RestaurantListPath, params: Query) {
  const query = new URLSearchParams()
  for (const key of ['q', 'page']) {
    const value = params.get(key)
    if (value) query.set(key, value)
  }
  for (const key of (path === '/search' || path === '/records') ? ['s','office','restaurantPage','tab','region','address','restaurantName','tag','sort-by'] : path === '/restaurant/hf' ? ['office'] : path === '/game/bingo' ? ['mission','region'] : path === '/game/worldcup' ? ['winner','office','size'] : []) {
    const value = params.get(key)
    if (value) query.set(key, value)
  }
  const filters = path === '/blackwhite' ? ['season[]', 'spoonClass[]'] : path === '/restaurant/hf' || path === '/influencer/intern' ? ['time-zone[]', 'food-style[]'] : []
  for (const key of filters) {
      for (const value of params.getAll(key)) query.append(key, value)
  }
  return path + (query.size ? '?' + query.toString() : '')
}
export function restaurantReturnHref(value: string | null | undefined) {
  if (!value || value.length > 5000 || /[\\#\r\n]/.test(value)) return null
  const [path, ...query] = value.split('?')
  if (!Object.hasOwn(labels, path)) return null
  return restaurantListHref(path as RestaurantListPath, new URLSearchParams(query.join('?')))
}
export function restaurantReviewsHref(restaurantId: number, list: string) {
  return '/records?' + new URLSearchParams({ restaurantId: String(restaurantId), restaurantReturn: list })
}
export function restaurantListLabel(href: string) {
  return labels[href.split('?')[0] as RestaurantListPath] || '맛집'
}
export function namedRestaurantReviewsHref(name: string, address: string, list: string) {
  return '/records?' + new URLSearchParams({ restaurantName: name, address, restaurantReturn: list })
}
