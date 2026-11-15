export function bookmarkListHref(params: { get(name: string): string | null }) {
  const query = new URLSearchParams()
  for (const key of ['q', 'region', 'category', 'sort', 'page']) {
    const value = params.get(key)
    if (value) query.set(key, value)
  }
  return '/bookmarks' + (query.size ? '?' + query.toString() : '')
}

// Only the application's saved-list route can be used as a return destination.
export function bookmarkReturnHref(value: string | null | undefined) {
  if (!value || value.length > 3000 || !/^\/bookmarks(?:\?|$)/.test(value) || /[\\#\r\n]/.test(value)) return null
  return bookmarkListHref(new URLSearchParams(value.split('?').slice(1).join('?')))
}

export function bookmarkedReviewsHref(restaurantId: number, list: string) {
  return '/records?' + new URLSearchParams({ restaurantId: String(restaurantId), bookmarkReturn: list })
}
