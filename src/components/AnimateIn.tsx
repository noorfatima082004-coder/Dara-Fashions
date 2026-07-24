import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react'

type AnimationType =
  | 'fade-up'
  | 'fade-in'
  | 'scale-in'
  | 'slide-right'
  | 'slide-left'
  | 'blur-in'
  | 'zoom-in'

interface AnimateInProps {
  children: ReactNode
  animation?: AnimationType
  delay?: number
  duration?: number
  className?: string
}

export function AnimateIn({
  children,
  animation = 'fade-up',
  delay = 0,
  duration = 350,
  className = '',
}: AnimateInProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      requestAnimationFrame(() => setVisible(true))
    })
    return () => cancelAnimationFrame(frame)
  }, [])

  const style: CSSProperties = {
    animationDelay: `${delay}ms`,
    animationDuration: `${duration}ms`,
  }

  return (
    <div
      ref={ref}
      style={style}
      className={`anim-${animation} ${visible ? 'anim-visible' : 'anim-hidden'} ${className}`}
    >
      {children}
    </div>
  )
}

interface PageEnterProps {
  children: ReactNode
  className?: string
}

export function PageEnter({ children, className = '' }: PageEnterProps) {
  return <div className={`page-enter ${className}`}>{children}</div>
}
