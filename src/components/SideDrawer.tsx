import { Link } from 'react-router-dom'
import { Home, LayoutGrid, Heart, ShoppingBag, User, Sparkles, X } from 'lucide-react'
import { LogoSmall } from './Logo'

interface SideDrawerProps {
  isOpen: boolean
  onClose: () => void
}

const navItems = [
  { path: '/home', icon: Home, label: 'Home' },
  { path: '/categories', icon: LayoutGrid, label: 'Categories' },
  { path: '/favorites', icon: Heart, label: 'Favorites' },
  { path: '/bag', icon: ShoppingBag, label: 'Bag' },
  { path: '/account', icon: User, label: 'Account' },
]

export function SideDrawer({ isOpen, onClose }: SideDrawerProps) {
  return (
    <>
      <div
        className={`fixed inset-0 z-50 bg-black/40 transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
        onClick={onClose}
        aria-hidden="true"
      />
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[78%] max-w-[300px] flex-col bg-white shadow-xl transition-transform duration-300 ease-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        role="dialog"
        aria-modal="true"
        aria-label="Menu"
      >
        <div className="flex items-center justify-between px-4 py-3">
          <LogoSmall />
          <button
            onClick={onClose}
            className="press-scale p-1 text-dara-charcoal"
            aria-label="Close menu"
          >
            <X size={20} strokeWidth={1.5} />
          </button>
        </div>

        <nav className="mt-2 flex flex-col px-2">
          {navItems.map(({ path, icon: Icon, label }) => (
            <Link
              key={path}
              to={path}
              onClick={onClose}
              className="press-scale flex items-center gap-3 rounded-dara px-3 py-3 text-sm font-medium text-dara-charcoal transition-colors hover:bg-dara-gray"
            >
              <Icon size={20} strokeWidth={1.5} />
              {label}
            </Link>
          ))}
        </nav>

        <div className="mx-4 my-2 border-t border-dara-gray-dark" />

        <div className="px-2">
          <Link
            to="/skin-analysis"
            onClick={onClose}
            className="press-scale flex items-center gap-3 rounded-dara bg-dara-tan/10 px-3 py-3 text-sm font-semibold text-dara-tan-dark transition-colors hover:bg-dara-tan/20"
          >
            <Sparkles size={20} strokeWidth={1.5} />
            Color &amp; Style Test
          </Link>
        </div>
      </aside>
    </>
  )
}
