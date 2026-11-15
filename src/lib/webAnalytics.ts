import type { BeforeSendEvent } from '@vercel/analytics/next'

// Hobby supports page views only. Do not include search/filter values in page URLs.
export function sanitizePageView(event: BeforeSendEvent): BeforeSendEvent | null {
  if (event.type !== 'pageview') return null
  try {
    const url = new URL(event.url)
    if (url.protocol !== 'https:' && url.protocol !== 'http:') return null
    url.search = ''
    url.hash = ''
    url.username = ''
    url.password = ''
    return { type: 'pageview', url: url.toString() }
  } catch {
    return null
  }
}

export function isAnalyticsEnabled(environment: string | undefined): boolean {
  return environment === 'production'
}
