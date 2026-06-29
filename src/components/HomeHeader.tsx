import { Link } from 'react-router-dom'
import { Menu, Search, ShoppingBag } from 'lucide-react'
import { LogoSmall } from './Logo'
import { useCart } from '../context/CartContext'

export function HomeHeader() {
  const { cartCount } = useCart()

  return (
    <header className="sticky top-0 z-40 flex items-center justify-between bg-white px-4 py-3">
      <button className="p-1 text-dara-charcoal" aria-label="Menu">
        <Menu size={22} strokeWidth={1.5} />
      </button>
      <LogoSmall />
      <div className="flex items-center gap-3">
        <button className="p-1 text-dara-charcoal" aria-label="Search">
          <Search size={20} strokeWidth={1.5} />
        </button>
        <Link to="/bag" className="relative p-1 text-dara-charcoal">
          <ShoppingBag size={20} strokeWidth={1.5} />
          {cartCount > 0 && (
            <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-dara-tan text-[10px] font-medium text-white">
              {cartCount}
            </span>
          )}
        </Link>
      </div>
    </header>
  )
}
