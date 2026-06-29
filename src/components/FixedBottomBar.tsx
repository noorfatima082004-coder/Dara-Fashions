import type { ReactNode } from 'react'

interface FixedBottomBarProps {
  children: ReactNode
  animate?: boolean
}

export function FixedBottomBar({ children, animate = true }: FixedBottomBarProps) {
  return (
    <div className="fixed-bottom-bar">
      <div className={`fixed-bottom-bar-inner ${animate ? 'cta-slide-up' : ''}`}>
        {children}
      </div>
    </div>
  )
}
