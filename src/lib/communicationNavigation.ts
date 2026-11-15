// Carry only list state; destinations are always internal communication routes.
export function communicationQuery(params: { get(name: string): string | null }) {
  const query = new URLSearchParams()
  for (const key of ['q', 'searchType', 'category', 'mine', 'page']) {
    const value = params.get(key)
    if (value !== null && value !== '') query.set(key, value)
  }
  const value = query.toString()
  return value ? '?' + value : ''
}

export function communicationListHref(params: { get(name: string): string | null }) {
  return '/communication' + communicationQuery(params)
}
