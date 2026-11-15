'use client'

import { Analytics } from '@vercel/analytics/next'
import { sanitizePageView } from '@/lib/webAnalytics'

export default function PreviewWebAnalytics() {
  return <Analytics beforeSend={sanitizePageView} debug={false} />
}
