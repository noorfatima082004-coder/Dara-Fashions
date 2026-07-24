import { Link } from 'react-router-dom'
import { Heart } from 'lucide-react'
import { useState } from 'react'
import type { Product } from '../types'
import { formatPrice } from '../data/mockData'
import { useCart } from '../context/CartContext'

interface ProductCardProps {
  product: Product
  variant?: 'grid' | 'scroll'
  index?: number
  tag?: string
}

export function ProductCard({ product, variant = 'grid', index = 0, tag }: ProductCardProps) {
  const { isFavorite, toggleFavorite } = useCart()
  const fav = isFavorite(product.id)
  const [heartAnim, setHeartAnim] = useState(false)

  const handleFavorite = (e: React.MouseEvent) => {
    e.preventDefault()
    toggleFavorite(product.id)
    setHeartAnim(true)
    setTimeout(() => setHeartAnim(false), 450)
  }

  return (
    <Link
      to={`/product/${product.id}`}
      className={`press-scale group relative block overflow-hidden rounded-dara bg-white shadow-sm transition-shadow duration-300 hover:shadow-md ${
        variant === 'scroll' ? 'w-40 shrink-0' : ''
      }`}
      style={{
        animation: `anim-fade-up 0.45s cubic-bezier(0.22, 1, 0.36, 1) ${Math.min(index * 50, 200)}ms forwards`,
        opacity: 0,
      }}
    >
      <div className="relative aspect-[3/4] overflow-hidden bg-dara-gray">
        <img
          src={product.image}
          alt={product.name}
          className="h-full w-full object-cover object-top transition-transform duration-500 ease-out group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-black/0 transition-colors duration-300 group-hover:bg-black/5" />
        <button
          onClick={handleFavorite}
          className="absolute right-2 top-2 rounded-full bg-white/80 p-1.5 backdrop-blur-sm transition-transform duration-200 hover:scale-110 active:scale-90"
          aria-label={fav ? 'Remove from favorites' : 'Add to favorites'}
        >
          <Heart
            size={16}
            strokeWidth={1.5}
            className={`transition-colors duration-300 ${
              fav ? 'fill-dara-tan text-dara-tan' : 'text-dara-charcoal'
            } ${heartAnim ? 'animate-heart-pop' : ''}`}
          />
        </button>
      </div>
      <div className="p-2.5">
        <p className="truncate text-xs font-medium text-dara-charcoal transition-colors group-hover:text-dara-tan">
          {product.name}
        </p>
        <p className="mt-0.5 text-xs text-gray-500">{formatPrice(product.price)}</p>
        {tag && <p className="mt-1 truncate text-[10px] font-medium text-dara-tan">{tag}</p>}
      </div>
    </Link>
  )
}
