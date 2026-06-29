import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Heart, Share2, ShoppingBag, Check } from 'lucide-react'
import { products, formatPrice } from '../data/mockData'
import { useCart } from '../context/CartContext'
import { PageEnter } from '../components/AnimateIn'
import { FixedBottomBar } from '../components/FixedBottomBar'

export function ProductDetailPage() {
  const { productId } = useParams()
  const navigate = useNavigate()
  const product = products.find((p) => p.id === productId)
  const { addToCart, isFavorite, toggleFavorite } = useCart()

  const [selectedColor, setSelectedColor] = useState(product?.colors[0]?.name ?? '')
  const [selectedSize, setSelectedSize] = useState(product?.sizes[1] ?? 'M')
  const [heartAnim, setHeartAnim] = useState(false)
  const [added, setAdded] = useState(false)

  if (!product) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-gray-400">Product not found</p>
      </div>
    )
  }

  const fav = isFavorite(product.id)

  const handleFavorite = () => {
    toggleFavorite(product.id)
    setHeartAnim(true)
    setTimeout(() => setHeartAnim(false), 450)
  }

  const handleAddToBag = () => {
    addToCart(product, selectedColor, selectedSize)
    setAdded(true)
    setTimeout(() => {
      setAdded(false)
      navigate('/bag')
    }, 700)
  }

  return (
    <PageEnter>
      <div className="app-shell">
        <div className="relative overflow-hidden">
          <div className="aspect-[3/4]">
            <img
              src={product.image}
              alt={product.name}
              className="hero-ken-burns h-full w-full object-cover object-top"
            />
          </div>
          <div
            className="absolute inset-x-0 top-0 flex items-center justify-between p-4"
            style={{
              animation: 'anim-fade-in 0.6s ease-out 0.4s forwards',
              opacity: 0,
            }}
          >
            <button
              onClick={() => navigate(-1)}
              className="press-scale rounded-full bg-white/80 p-2 backdrop-blur-sm transition-transform hover:scale-105"
            >
              <ArrowLeft size={20} strokeWidth={1.5} />
            </button>
            <div className="flex gap-2">
              <button
                onClick={handleFavorite}
                className="press-scale rounded-full bg-white/80 p-2 backdrop-blur-sm transition-transform hover:scale-105"
              >
                <Heart
                  size={20}
                  strokeWidth={1.5}
                  className={`transition-colors duration-300 ${
                    fav ? 'fill-dara-tan text-dara-tan' : ''
                  } ${heartAnim ? 'animate-heart-pop' : ''}`}
                />
              </button>
              <button className="press-scale rounded-full bg-white/80 p-2 backdrop-blur-sm transition-transform hover:scale-105">
                <Share2 size={20} strokeWidth={1.5} />
              </button>
            </div>
          </div>
        </div>

        <div className="px-5 pb-28 pt-5">
          <h1
            className="font-serif text-2xl font-medium"
            style={{
              animation: 'hero-text-reveal 0.7s cubic-bezier(0.22, 1, 0.36, 1) 0.2s forwards',
              opacity: 0,
            }}
          >
            {product.name}
          </h1>
          <p
            className="mt-1 text-lg font-semibold"
            style={{
              animation: 'hero-text-reveal 0.7s cubic-bezier(0.22, 1, 0.36, 1) 0.35s forwards',
              opacity: 0,
            }}
          >
            {formatPrice(product.price)}
          </p>
          <p
            className="mt-3 text-sm leading-relaxed text-gray-600"
            style={{
              animation: 'hero-text-reveal 0.7s cubic-bezier(0.22, 1, 0.36, 1) 0.5s forwards',
              opacity: 0,
            }}
          >
            {product.description}
          </p>

          <div
            className="mt-6"
            style={{
              animation: 'anim-fade-up 0.6s cubic-bezier(0.22, 1, 0.36, 1) 0.6s forwards',
              opacity: 0,
            }}
          >
            <p className="mb-3 text-xs font-semibold tracking-wider text-gray-500">COLOR</p>
            <div className="flex gap-3">
              {product.colors.map((color) => (
                <button
                  key={color.name}
                  onClick={() => setSelectedColor(color.name)}
                  className={`h-8 w-8 rounded-full border-2 transition-all duration-300 hover:scale-110 active:scale-95 ${
                    selectedColor === color.name
                      ? 'border-dara-charcoal ring-2 ring-dara-charcoal ring-offset-2 scale-110'
                      : 'border-dara-gray-dark'
                  }`}
                  style={{ backgroundColor: color.hex }}
                  title={color.name}
                />
              ))}
            </div>
            <p className="mt-2 text-xs text-gray-500">{selectedColor}</p>
          </div>

          <div
            className="mt-6"
            style={{
              animation: 'anim-fade-up 0.6s cubic-bezier(0.22, 1, 0.36, 1) 0.75s forwards',
              opacity: 0,
            }}
          >
            <p className="mb-3 text-xs font-semibold tracking-wider text-gray-500">SIZE</p>
            <div className="flex flex-wrap gap-2">
              {product.sizes.map((size) => (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className={`flex h-10 w-10 items-center justify-center rounded-dara border text-xs font-medium transition-all duration-300 hover:scale-105 active:scale-95 ${
                    selectedSize === size
                      ? 'border-dara-charcoal bg-dara-charcoal text-white scale-105'
                      : 'border-dara-gray-dark text-dara-charcoal hover:border-dara-charcoal'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>
        </div>

        <FixedBottomBar>
          <div className="border-t border-dara-gray-dark bg-white/95 p-4 backdrop-blur-md">
            <button
              onClick={handleAddToBag}
              disabled={added}
              className={`btn-shimmer press-scale flex w-full items-center justify-center gap-2 rounded-dara py-3.5 text-xs font-semibold tracking-wider text-white transition-all duration-300 ${
                added
                  ? 'bg-green-600 btn-added-pulse'
                  : 'bg-dara-tan hover:bg-dara-tan-dark'
              }`}
            >
              {added ? (
                <>
                  <Check size={18} strokeWidth={2} />
                  ADDED TO BAG
                </>
              ) : (
                <>
                  <ShoppingBag size={18} strokeWidth={1.5} />
                  ADD TO BAG
                </>
              )}
            </button>
          </div>
        </FixedBottomBar>
      </div>
    </PageEnter>
  )
}
