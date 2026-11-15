import { ApplicationLayout } from '@/app/(app)/application-layout'
import type { ReactNode } from 'react'

export default function Layout({ children }: { children: ReactNode }) {
  return <ApplicationLayout>{children}</ApplicationLayout>
}
