import { Link } from 'react-router-dom'
import { Minus, Plus, Trash2 } from 'lucide-react'
import { AppLayout } from '../components/AppLayout'
import { PageHeader } from '../components/PageHeader'
import { FixedBottomBar } from '../components/FixedBottomBar'
import { AnimateIn } from '../components/AnimateIn'
import { formatPrice } from '../data/mockData'
import { useCart } from '../context/CartContext'

const SHIPPING = 250

export function BagPage() {
  const { items, removeFromCart, updateQuantity, subtotal } = useCart()
  const total = subtotal + (items.length > 0 ? SHIPPING : 0)

  return (
    <AppLayout showNav={false}>
      <PageHeader
        title="My Bag"
        backTo="/home"
        rightAction={
          <button className="text-xs font-medium text-dara-tan transition-colors hover:text-dara-tan-dark">
            Edit
          </button>
        }
      />

      {items.length === 0 ? (
        <AnimateIn animation="scale-in" className="flex flex-col items-center justify-center px-4 py-20">
          <p className="text-sm text-gray-400">Your bag is empty</p>
          <Link
            to="/categories"
            className="btn-shimmer press-scale mt-4 rounded-dara bg-dara-tan px-6 py-2.5 text-xs font-semibold text-white"
          >
            START SHOPPING
          </Link>
        </AnimateIn>
      ) : (
        <div className="pb-28">
          <div className="divide-y divide-dara-gray-dark px-4">
            {items.map((item, i) => (
              <div
                key={`${item.product.id}-${item.color}-${item.size}`}
                className="bag-item-enter flex min-w-0 gap-3 py-4"
                style={{ animationDelay: `${i * 60}ms`, opacity: 0 }}
              >
                <Link
                  to={`/product/${item.product.id}`}
                  className="h-24 w-20 shrink-0 overflow-hidden rounded-dara bg-dara-gray"
                >
                  <img
                    src={item.product.image}
                    alt={item.product.name}
                    className="h-full w-full object-cover object-top"
                  />
                </Link>
                <div className="flex min-w-0 flex-1 flex-col justify-between">
                  <div className="min-w-0">
                    <h3 className="truncate text-sm font-medium">{item.product.name}</h3>
                    <p className="mt-0.5 text-xs text-gray-500">
                      Size: {item.size} · Color: {item.color}
                    </p>
                    <p className="mt-1 text-sm font-medium">
                      {formatPrice(item.product.price)}
                    </p>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex shrink-0 items-center gap-3 rounded-dara border border-dara-gray-dark px-2 py-1">
                      <button
                        onClick={() =>
                          updateQuantity(
                            item.product.id,
                            item.color,
                            item.size,
                            item.quantity - 1
                          )
                        }
                        className="press-scale p-0.5 text-gray-500"
                        disabled={item.quantity <= 1}
                      >
                        <Minus size={14} />
                      </button>
                      <span className="w-4 text-center text-xs font-medium">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() =>
                          updateQuantity(
                            item.product.id,
                            item.color,
                            item.size,
                            item.quantity + 1
                          )
                        }
                        className="press-scale p-0.5 text-gray-500"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                    <button
                      onClick={() =>
                        removeFromCart(item.product.id, item.color, item.size)
                      }
                      className="press-scale shrink-0 p-1 text-gray-400"
                    >
                      <Trash2 size={16} strokeWidth={1.5} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <AnimateIn animation="fade-up" delay={150} duration={400}>
            <div className="mt-4 border-t border-dara-gray-dark px-4 pt-4">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-gray-500">
                  <span>Subtotal</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-gray-500">
                  <span>Shipping</span>
                  <span>{formatPrice(SHIPPING)}</span>
                </div>
                <div className="flex justify-between border-t border-dara-gray-dark pt-2 text-base font-semibold">
                  <span>Total</span>
                  <span className="text-dara-charcoal">{formatPrice(total)}</span>
                </div>
              </div>
            </div>
          </AnimateIn>

          <FixedBottomBar>
            <div className="border-t border-dara-gray-dark bg-white/95 p-4 backdrop-blur-md">
              <button className="btn-shimmer press-scale w-full rounded-dara bg-dara-charcoal py-3.5 text-xs font-semibold tracking-wider text-white">
                PROCEED TO CHECKOUT
              </button>
            </div>
          </FixedBottomBar>
        </div>
      )}
    </AppLayout>
  )
}
