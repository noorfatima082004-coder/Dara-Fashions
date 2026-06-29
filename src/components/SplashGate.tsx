import { useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'

const SPLASH_KEY = 'dara_splash_seen'

export function SplashGate({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    const seen = sessionStorage.getItem(SPLASH_KEY)
    if (!seen && location.pathname !== '/') {
      navigate('/', { replace: true })
    }
  }, [location.pathname, navigate])

  return <>{children}</>
}

export function markSplashSeen() {
  sessionStorage.setItem(SPLASH_KEY, '1')
}
