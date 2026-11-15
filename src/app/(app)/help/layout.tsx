import { ApplicationLayout } from '@/app/(app)/application-layout'
import type { ReactNode } from 'react'

export default function HelpLayout({ children }: { children: ReactNode }) {
  return <ApplicationLayout>{children}</ApplicationLayout>
}
