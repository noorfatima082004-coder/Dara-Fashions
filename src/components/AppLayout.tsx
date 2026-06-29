import type { ReactNode } from 'react'
import { BottomNav } from './BottomNav'
import { PageEnter } from './AnimateIn'

interface AppLayoutProps {
  children: ReactNode
  showNav?: boolean
}

export function AppLayout({ children, showNav = true }: AppLayoutProps) {
  return (
    <PageEnter>
      <div className="app-shell">
        {children}
        {showNav && <div className="h-16 shrink-0" />}
        {showNav && <BottomNav />}
      </div>
    </PageEnter>
  )
}
