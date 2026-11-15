import Aside from '@/components/aside'
import { ApplicationLayout } from '../(app)/application-layout'
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <Aside.Provider>
      <ApplicationLayout>{children}</ApplicationLayout>
    </Aside.Provider>
  )
}
