import { ApplicationLayout } from '@/app/(app)/application-layout'
import { ManagementGuard } from '@/lib/managementAccess'
export default function Layout({children}:{children:React.ReactNode}) { return <ApplicationLayout><ManagementGuard>{children}</ManagementGuard></ApplicationLayout> }
