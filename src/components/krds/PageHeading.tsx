import Link from 'next/link'
import { ReactNode } from 'react'

export function Breadcrumb({ current, parent }: { current: string; parent?: { label: string; href: string } }) {
  return (
    <nav className="kr-breadcrumb" aria-label="현재 위치">
      <Link href="/">홈</Link>
      <span aria-hidden="true">›</span>
      {parent && (
        <>
          <Link href={parent.href}>{parent.label}</Link>
          <span aria-hidden="true">›</span>
        </>
      )}
      <span aria-current="page">{current}</span>
    </nav>
  )
}
export function PageHeading({
  title,
  description,
  action,
}: {
  title: string
  description?: string
  action?: ReactNode
}) {
  return (
    <header className="kr-page-heading">
      <div>
        <h1>{title}</h1>
        {description && <p>{description}</p>}
      </div>
      {action}
    </header>
  )
}
export function StatusMessage({ children, error = false }: { children?: ReactNode; error?: boolean }) {
  return (
    <div
      role={error ? 'alert' : 'status'}
      aria-live={error ? 'assertive' : 'polite'}
      className={children ? `kr-message ${error ? 'kr-message-error' : ''}` : undefined}
    >
      {children}
    </div>
  )
}
