import { Link, useLocation } from 'react-router-dom'
import { Home, LayoutGrid, Heart, ShoppingBag, User } from 'lucide-react'
import { useCart } from '../context/CartContext'
import { useAnimatedCounter } from '../hooks/useAnimatedCounter'
import { useEffect, useRef, useState } from 'react'

const navItems = [
  { path: '/home', icon: Home, label: 'Home' },
  { path: '/categories', icon: LayoutGrid, label: 'Categories' },
  { path: '/favorites', icon: Heart, label: 'Favorites' },
  { path: '/bag', icon: ShoppingBag, label: 'Bag' },
  { path: '/account', icon: User, label: 'Account' },
]

export function BottomNav() {
  const location = useLocation()
  const { cartCount } = useCart()
  const animatedCount = useAnimatedCounter(cartCount)
  const [badgeBounce, setBadgeBounce] = useState(false)
  const prevCount = useRef(cartCount)

  useEffect(() => {
    if (cartCount > prevCount.current) {
      setBadgeBounce(true)
      const t = setTimeout(() => setBadgeBounce(false), 400)
      prevCount.current = cartCount
      return () => clearTimeout(t)
    }
    prevCount.current = cartCount
  }, [cartCount])

  const activeIndex = navItems.findIndex(
    ({ path }) =>
      location.pathname === path || location.pathname.startsWith(path + '/')
  )

  return (
    <nav className="fixed-bottom-bar">
      <div className="fixed-bottom-bar-inner border-t border-dara-gray-dark bg-white/95 backdrop-blur-md">
        <div className="relative flex items-center justify-around px-2 py-2">
          <div
            className="absolute top-1 h-0.5 rounded-full bg-dara-tan transition-all duration-300 ease-out"
            style={{
              width: '36px',
              left: `calc(${(activeIndex / navItems.length) * 100}% + ${100 / navItems.length / 2}% - 18px)`,
              opacity: activeIndex >= 0 ? 1 : 0,
            }}
          />

          {navItems.map(({ path, icon: Icon, label }) => {
            const active =
              location.pathname === path || location.pathname.startsWith(path + '/')
            const isBag = path === '/bag'
            return (
              <Link
                key={path}
                to={path}
                className={`press-scale relative flex flex-col items-center gap-0.5 px-3 py-1 transition-colors duration-200 ${
                  active ? 'text-dara-charcoal' : 'text-gray-400'
                }`}
              >
                <Icon size={22} strokeWidth={active ? 2 : 1.5} />
                {isBag && cartCount > 0 && (
                  <span
                    className={`absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-dara-tan text-[10px] font-medium text-white ${
                      badgeBounce ? 'animate-nav-bounce' : ''
                    }`}
                  >
                    {animatedCount}
                  </span>
                )}
                <span className="text-[10px] font-medium">{label}</span>
              </Link>
            )
          })}
        </div>
      </div>
    </nav>
  )
}
