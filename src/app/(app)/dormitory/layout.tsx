import { ApplicationLayout } from '@/app/(app)/application-layout'
import { ReactNode } from 'react'

export default function Layout({ children }: { children: ReactNode }) {
  return <ApplicationLayout>{children}</ApplicationLayout>
}
