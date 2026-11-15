export function searchQuery(params: { get(name: string): string | null }) {
  const query = new URLSearchParams()
  for (const key of ['s', 'region', 'address', 'restaurantName', 'restaurantId', 'tag', 'tab', 'sort-by', 'page', 'office', 'restaurantPage', 'bookmarkReturn', 'restaurantReturn']) {
    const value = params.get(key)
    if (value !== null && value !== '') query.set(key, value)
  }
  return query.size ? '?' + query.toString() : ''
}
export function searchListHref(params: { get(name: string): string | null }) {
  return '/records' + searchQuery(params)
}
