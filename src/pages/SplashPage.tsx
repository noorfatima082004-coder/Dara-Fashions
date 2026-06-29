import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

export function SplashPage() {
  const navigate = useNavigate()
  const [exiting, setExiting] = useState(false)

  useEffect(() => {
    const exitTimer = setTimeout(() => setExiting(true), 2800)
    const navTimer = setTimeout(() => navigate('/home'), 3400)
    return () => {
      clearTimeout(exitTimer)
      clearTimeout(navTimer)
    }
  }, [navigate])

  return (
    <div
      className={`app-shell relative flex min-h-[100dvh] flex-col items-center justify-between overflow-hidden bg-[#FAF8F5] transition-opacity duration-500 ${
        exiting ? 'opacity-0' : 'opacity-100'
      }`}
    >
      {/* Ambient silk texture */}
      <div
        className="splash-bg absolute inset-0 bg-cover bg-center opacity-30"
        style={{
          backgroundImage:
            'url(https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&q=80)',
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-white/90 via-[#FAF8F5]/80 to-white/95" />

      {/* Shimmer accent */}
      <div className="splash-shimmer absolute left-0 top-1/3 h-px w-full" />

      {/* Logo & brand */}
      <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-8">
        <div className="splash-logo-reveal mb-6">
          <img
            src="/logo.png"
            alt="Dara"
            className="h-24 w-24 object-contain drop-shadow-sm"
          />
        </div>

        <h1 className="splash-brand-name font-serif text-4xl font-medium tracking-[0.15em] text-dara-charcoal">
          Dara
        </h1>

        <p className="splash-subtitle mt-4 text-[10px] font-medium tracking-[0.45em] text-gray-500">
          PAKISTANI FASHION
        </p>

        {/* Gold divider */}
        <div className="splash-divider mt-8 flex items-center gap-3">
          <div className="h-px w-12 bg-gradient-to-r from-transparent to-dara-tan" />
          <div className="h-1 w-1 rotate-45 bg-dara-tan" />
          <div className="h-px w-12 bg-gradient-to-l from-transparent to-dara-tan" />
        </div>
      </div>

      {/* Tagline & progress */}
      <div className="relative z-10 mb-16 flex w-full flex-col items-center gap-6 px-8">
        <p className="splash-tagline font-serif text-xl italic text-dara-charcoal/80">
          Timeless style. Modern you.
        </p>

        <div className="splash-dots flex items-center gap-2">
          <div className="h-1.5 w-1.5 rounded-full bg-dara-tan" />
          <div className="h-1.5 w-1.5 rounded-full bg-dara-gray-dark/50" />
          <div className="h-1.5 w-1.5 rounded-full bg-dara-gray-dark/50" />
        </div>

        <div className="h-px w-32 overflow-hidden rounded-full bg-dara-gray-dark/30">
          <div className="splash-progress h-full rounded-full bg-dara-tan" />
        </div>
      </div>
    </div>
  )
}
