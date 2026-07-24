import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Minus, Plus, Trash2, Check, ShoppingBag, Tag, X, Loader2 } from 'lucide-react'
import { AppLayout } from '../components/AppLayout'
import { PageHeader } from '../components/PageHeader'
import { FixedBottomBar } from '../components/FixedBottomBar'
import { AnimateIn } from '../components/AnimateIn'
import { formatPrice } from '../data/mockData'
import { useCart } from '../context/CartContext'
import type { CartItem } from '../types'

const SHIPPING = 250
const FREE_SHIPPING_THRESHOLD = 15000
const MAX_QTY = 10
const PROMO_CODES: Record<string, number> = {
  DARA10: 10,
  WELCOME15: 15,
}

const keyOf = (item: CartItem) => `${item.product.id}-${item.color}-${item.size}`

export function BagPage() {
  const { items, removeFromCart, updateQuantity, removeMany, clearCart, subtotal } = useCart()
  const navigate = useNavigate()

  const [selectMode, setSelectMode] = useState(false)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [removing, setRemoving] = useState<Set<string>>(new Set())

  const [promoInput, setPromoInput] = useState('')
  const [appliedPromo, setAppliedPromo] = useState<string | null>(null)
  const [promoError, setPromoError] = useState(false)

  const [checkingOut, setCheckingOut] = useState(false)
  const [orderPlaced, setOrderPlaced] = useState(false)
  const [lastOrderTotal, setLastOrderTotal] = useState(0)

  const discountPercent = appliedPromo ? PROMO_CODES[appliedPromo] : 0
  const discountAmount = Math.round((subtotal * discountPercent) / 100)
  const freeShippingUnlocked = subtotal >= FREE_SHIPPING_THRESHOLD
  const shippingCost = items.length === 0 ? 0 : freeShippingUnlocked ? 0 : SHIPPING
  const total = Math.max(0, subtotal - discountAmount + shippingCost)
  const remainingForFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal)
  const freeShippingProgress = Math.min(100, (subtotal / FREE_SHIPPING_THRESHOLD) * 100)
  const allSelected = items.length > 0 && selected.size === items.length

  const toggleSelectMode = () => {
    setSelectMode((v) => !v)
    setSelected(new Set())
  }

  const toggleSelectItem = (k: string) => {
    setSelected((prev) => {
      const next = new Set(prev)
      next.has(k) ? next.delete(k) : next.add(k)
      return next
    })
  }

  const toggleSelectAll = () => {
    setSelected(allSelected ? new Set() : new Set(items.map(keyOf)))
  }

  const handleRemove = (item: CartItem) => {
    const k = keyOf(item)
    setRemoving((prev) => new Set(prev).add(k))
    setTimeout(() => {
      removeFromCart(item.product.id, item.color, item.size)
      setRemoving((prev) => {
        const next = new Set(prev)
        next.delete(k)
        return next
      })
    }, 280)
  }

  const handleBulkRemove = () => {
    if (selected.size === 0) return
    const keys = Array.from(selected)
    setRemoving((prev) => new Set([...prev, ...keys]))
    setTimeout(() => {
      removeMany(keys)
      setRemoving(new Set())
      setSelected(new Set())
      setSelectMode(false)
    }, 280)
  }

  const handleQtyChange = (item: CartItem, delta: number) => {
    const next = item.quantity + delta
    if (next < 1 || next > MAX_QTY) return
    updateQuantity(item.product.id, item.color, item.size, next)
  }

  const handleApplyPromo = () => {
    const code = promoInput.trim().toUpperCase()
    if (!code) return
    if (PROMO_CODES[code]) {
      setAppliedPromo(code)
      setPromoInput('')
      setPromoError(false)
    } else {
      setPromoError(true)
      setTimeout(() => setPromoError(false), 500)
    }
  }

  const handleCheckout = () => {
    if (checkingOut || items.length === 0) return
    setCheckingOut(true)
    setTimeout(() => {
      setLastOrderTotal(total)
      clearCart()
      setCheckingOut(false)
      setOrderPlaced(true)
    }, 900)
  }

  const handleContinueShopping = () => {
    setOrderPlaced(false)
    navigate('/home')
  }

  if (orderPlaced) {
    return (
      <AppLayout showNav={false}>
        <div className="flex min-h-[85vh] flex-col items-center justify-center px-8 text-center">
          <AnimateIn animation="scale-in">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-dara-tan/15">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-dara-tan text-white">
                <Check size={28} strokeWidth={2.5} />
              </div>
            </div>
          </AnimateIn>
          <AnimateIn animation="fade-up" delay={150}>
            <h1 className="mt-6 font-serif text-2xl font-medium">Order Placed!</h1>
          </AnimateIn>
          <AnimateIn animation="fade-up" delay={250}>
            <p className="mt-2 text-sm text-gray-500">
              Thank you for shopping with DARA. Your order is being prepared.
            </p>
          </AnimateIn>
          <AnimateIn animation="fade-up" delay={350} className="w-full">
            <div className="mt-6 w-full rounded-dara border border-dara-gray-dark p-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Order Total</span>
                <span className="font-semibold text-dara-charcoal">
                  {formatPrice(lastOrderTotal)}
                </span>
              </div>
            </div>
          </AnimateIn>
          <AnimateIn animation="fade-up" delay={450} className="w-full">
            <button
              onClick={handleContinueShopping}
              className="btn-shimmer press-scale mt-8 w-full rounded-dara bg-dara-charcoal py-3.5 text-xs font-semibold tracking-wider text-white"
            >
              CONTINUE SHOPPING
            </button>
          </AnimateIn>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout showNav={false}>
      <PageHeader
        title="My Bag"
        backTo="/home"
        rightAction={
          items.length > 0 && (
            <button
              onClick={toggleSelectMode}
              className="text-xs font-medium text-dara-tan transition-colors hover:text-dara-tan-dark"
            >
              {selectMode ? 'Done' : 'Edit'}
            </button>
          )
        }
      />

      {items.length === 0 ? (
        <AnimateIn animation="scale-in" className="flex flex-col items-center justify-center px-4 py-20">
          <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-dara-gray">
            <ShoppingBag size={30} strokeWidth={1.2} className="text-gray-300" />
          </div>
          <p className="text-sm text-gray-400">Your bag is empty</p>
          <p className="mt-1 text-xs text-gray-400">Looks like you haven&apos;t added anything yet</p>
          <Link
            to="/categories"
            className="btn-shimmer press-scale mt-5 rounded-dara bg-dara-tan px-6 py-2.5 text-xs font-semibold text-white"
          >
            START SHOPPING
          </Link>
        </AnimateIn>
      ) : (
        <div className="pb-28">
          <div className="flex items-center justify-between px-4 pb-1 pt-3 text-xs text-gray-500">
            <span>
              {items.length} {items.length === 1 ? 'item' : 'items'}
            </span>
            {selectMode && (
              <button
                onClick={toggleSelectAll}
                className="press-scale flex items-center gap-1.5 font-medium text-dara-charcoal"
              >
                <span
                  className={`flex h-4 w-4 items-center justify-center rounded-full border-2 transition-colors ${
                    allSelected ? 'border-dara-charcoal bg-dara-charcoal' : 'border-dara-gray-dark'
                  }`}
                >
                  {allSelected && <Check size={10} strokeWidth={3} className="text-white" />}
                </span>
                {allSelected ? 'Deselect All' : 'Select All'}
              </button>
            )}
          </div>

          <div className="divide-y divide-dara-gray-dark px-4">
            {items.map((item, i) => {
              const k = keyOf(item)
              const isRemoving = removing.has(k)
              return (
                <div
                  key={k}
                  className="bag-item-enter flex min-w-0 items-start gap-3"
                  style={{
                    animationDelay: `${i * 60}ms`,
                    opacity: isRemoving ? undefined : 0,
                    maxHeight: isRemoving ? 0 : 200,
                    paddingTop: isRemoving ? 0 : '1rem',
                    paddingBottom: isRemoving ? 0 : '1rem',
                    marginBottom: isRemoving ? 0 : undefined,
                    overflow: 'hidden',
                    transform: isRemoving ? 'translateX(-16px) scale(0.96)' : undefined,
                    transitionProperty: 'max-height, opacity, transform, padding',
                    transitionDuration: '280ms',
                    transitionTimingFunction: 'cubic-bezier(0.22, 1, 0.36, 1)',
                  }}
                >
                  {selectMode && (
                    <button
                      onClick={() => toggleSelectItem(k)}
                      className="press-scale mt-9 shrink-0"
                      aria-label="Select item"
                    >
                      <span
                        className={`flex h-5 w-5 items-center justify-center rounded-full border-2 transition-colors ${
                          selected.has(k)
                            ? 'border-dara-charcoal bg-dara-charcoal'
                            : 'border-dara-gray-dark'
                        }`}
                      >
                        {selected.has(k) && <Check size={12} strokeWidth={3} className="text-white" />}
                      </span>
                    </button>
                  )}
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
                  <div className="flex min-w-0 flex-1 flex-col justify-between self-stretch">
                    <div className="min-w-0">
                      <h3 className="truncate text-sm font-medium">{item.product.name}</h3>
                      <p className="mt-0.5 text-xs text-gray-500">
                        Size: {item.size} · Color: {item.color}
                      </p>
                      <p className="mt-1 text-sm font-medium">{formatPrice(item.product.price)}</p>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex shrink-0 items-center gap-3 rounded-dara border border-dara-gray-dark px-2 py-1">
                        <button
                          onClick={() => handleQtyChange(item, -1)}
                          className="press-scale p-0.5 text-gray-500 disabled:opacity-30"
                          disabled={item.quantity <= 1}
                          aria-label="Decrease quantity"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="w-4 text-center text-xs font-medium tabular-nums">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => handleQtyChange(item, 1)}
                          className="press-scale p-0.5 text-gray-500 disabled:opacity-30"
                          disabled={item.quantity >= MAX_QTY}
                          title={item.quantity >= MAX_QTY ? 'Maximum quantity reached' : undefined}
                          aria-label="Increase quantity"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                      {!selectMode && (
                        <button
                          onClick={() => handleRemove(item)}
                          className="press-scale shrink-0 p-1 text-gray-400 transition-colors hover:text-red-500"
                          aria-label="Remove item"
                        >
                          <Trash2 size={16} strokeWidth={1.5} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          <AnimateIn animation="fade-up" delay={100} duration={400}>
            <div className="mx-4 mt-3 rounded-dara bg-dara-gray p-3">
              {freeShippingUnlocked ? (
                <div className="flex items-center gap-2 text-xs font-medium text-dara-charcoal">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-dara-tan text-white">
                    <Check size={12} strokeWidth={3} />
                  </span>
                  You&apos;ve unlocked FREE shipping!
                </div>
              ) : (
                <>
                  <p className="text-xs text-gray-600">
                    Add{' '}
                    <span className="font-semibold text-dara-charcoal">
                      {formatPrice(remainingForFreeShipping)}
                    </span>{' '}
                    more for FREE shipping
                  </p>
                  <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-dara-gray-dark">
                    <div
                      className="h-full rounded-full bg-dara-tan transition-all duration-500 ease-out"
                      style={{ width: `${freeShippingProgress}%` }}
                    />
                  </div>
                </>
              )}
            </div>
          </AnimateIn>

          <AnimateIn animation="fade-up" delay={150} duration={400}>
            <div className="mx-4 mt-3">
              {appliedPromo ? (
                <div className="flex items-center justify-between rounded-dara border border-dara-tan bg-dara-tan/10 px-3 py-2.5">
                  <div className="flex items-center gap-2 text-xs font-medium text-dara-charcoal">
                    <Tag size={14} className="text-dara-tan" />
                    <span>
                      {appliedPromo} applied — {PROMO_CODES[appliedPromo]}% off
                    </span>
                  </div>
                  <button
                    onClick={() => setAppliedPromo(null)}
                    className="press-scale p-1 text-gray-400"
                    aria-label="Remove promo code"
                  >
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <>
                  <div className={`flex items-center gap-2 ${promoError ? 'animate-shake' : ''}`}>
                    <input
                      value={promoInput}
                      onChange={(e) => setPromoInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleApplyPromo()}
                      placeholder="Promo code"
                      className={`h-10 flex-1 min-w-0 rounded-dara border bg-white px-3 text-xs uppercase tracking-wide text-dara-charcoal outline-none transition-colors placeholder:normal-case placeholder:text-gray-400 focus:border-dara-charcoal ${
                        promoError ? 'border-red-400' : 'border-dara-gray-dark'
                      }`}
                    />
                    <button
                      onClick={handleApplyPromo}
                      disabled={!promoInput.trim()}
                      className="press-scale h-10 shrink-0 rounded-dara bg-dara-charcoal px-4 text-xs font-semibold text-white transition-opacity disabled:opacity-40"
                    >
                      Apply
                    </button>
                  </div>
                  {promoError && (
                    <p className="mt-1.5 text-[11px] text-red-500">Invalid promo code</p>
                  )}
                </>
              )}
            </div>
          </AnimateIn>

          <AnimateIn animation="fade-up" delay={200} duration={400}>
            <div className="mt-4 border-t border-dara-gray-dark px-4 pt-4">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-gray-500">
                  <span>Subtotal</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-dara-tan-dark">
                    <span>Discount ({appliedPromo})</span>
                    <span>-{formatPrice(discountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-gray-500">
                  <span>Shipping</span>
                  <span className={shippingCost === 0 ? 'font-medium text-dara-tan-dark' : ''}>
                    {shippingCost === 0 ? 'FREE' : formatPrice(shippingCost)}
                  </span>
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
              {selectMode ? (
                <button
                  onClick={handleBulkRemove}
                  disabled={selected.size === 0}
                  className="press-scale flex w-full items-center justify-center gap-2 rounded-dara border border-red-300 py-3.5 text-xs font-semibold tracking-wider text-red-500 transition-opacity disabled:opacity-40"
                >
                  <Trash2 size={16} strokeWidth={1.5} />
                  REMOVE SELECTED{selected.size > 0 ? ` (${selected.size})` : ''}
                </button>
              ) : (
                <button
                  onClick={handleCheckout}
                  disabled={checkingOut}
                  className={`btn-shimmer press-scale flex w-full items-center justify-center gap-2 rounded-dara py-3.5 text-xs font-semibold tracking-wider text-white transition-all duration-300 disabled:opacity-70 ${
                    checkingOut ? 'bg-dara-tan-dark' : 'bg-dara-charcoal'
                  }`}
                >
                  {checkingOut ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      PROCESSING...
                    </>
                  ) : (
                    <>PROCEED TO CHECKOUT · {formatPrice(total)}</>
                  )}
                </button>
              )}
            </div>
          </FixedBottomBar>
        </div>
      )}
    </AppLayout>
  )
}
