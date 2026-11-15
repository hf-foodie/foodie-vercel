import { ReactNode } from 'react'
import { Breadcrumb, PageHeading } from './PageHeading'
export default function FormPage({
  title,
  description,
  wide = false,
  children,
}: {
  title: string
  description: string
  wide?: boolean
  children: ReactNode
}) {
  return (
    <main className={'kr-container kr-main kr-form-page ' + (wide ? 'wide' : '')}>
      <Breadcrumb current={title} />
      <PageHeading title={title} description={description} />
      <section className="kr-form-panel" aria-label={title}>
        {children}
      </section>
    </main>
  )
}
