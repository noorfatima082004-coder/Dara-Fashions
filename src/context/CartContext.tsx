import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from 'react'
import type { CartItem, Product } from '../types'

interface CartContextValue {
  items: CartItem[]
  favorites: string[]
  addToCart: (product: Product, color: string, size: string) => void
  removeFromCart: (productId: string, color: string, size: string) => void
  updateQuantity: (productId: string, color: string, size: string, quantity: number) => void
  removeMany: (keys: string[]) => void
  clearCart: () => void
  toggleFavorite: (productId: string) => void
  isFavorite: (productId: string) => boolean
  cartCount: number
  subtotal: number
}

const CartContext = createContext<CartContextValue | null>(null)

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([
    {
      product: {
        id: '2',
        name: 'Black Classic Shirt',
        price: 7990,
        image: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=600&q=80',
        category: 'shirts',
        subcategory: 'formal',
        description: '',
        colors: [],
        sizes: [],
      },
      color: 'Black',
      size: 'M',
      quantity: 1,
    },
    {
      product: {
        id: '1',
        name: 'White Textured Shirt',
        price: 5990,
        image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600&q=80',
        category: 'shirts',
        subcategory: 'casual',
        description: '',
        colors: [],
        sizes: [],
      },
      color: 'White',
      size: 'L',
      quantity: 1,
    },
  ])
  const [favorites, setFavorites] = useState<string[]>(['1', '3'])

  const addToCart = useCallback((product: Product, color: string, size: string) => {
    setItems((prev) => {
      const existing = prev.find(
        (i) => i.product.id === product.id && i.color === color && i.size === size
      )
      if (existing) {
        return prev.map((i) =>
          i.product.id === product.id && i.color === color && i.size === size
            ? { ...i, quantity: i.quantity + 1 }
            : i
        )
      }
      return [...prev, { product, color, size, quantity: 1 }]
    })
  }, [])

  const removeFromCart = useCallback((productId: string, color: string, size: string) => {
    setItems((prev) =>
      prev.filter(
        (i) => !(i.product.id === productId && i.color === color && i.size === size)
      )
    )
  }, [])

  const updateQuantity = useCallback(
    (productId: string, color: string, size: string, quantity: number) => {
      if (quantity < 1) return
      setItems((prev) =>
        prev.map((i) =>
          i.product.id === productId && i.color === color && i.size === size
            ? { ...i, quantity }
            : i
        )
      )
    },
    []
  )

  const removeMany = useCallback((keys: string[]) => {
    setItems((prev) =>
      prev.filter((i) => !keys.includes(`${i.product.id}-${i.color}-${i.size}`))
    )
  }, [])

  const clearCart = useCallback(() => {
    setItems([])
  }, [])

  const toggleFavorite = useCallback((productId: string) => {
    setFavorites((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    )
  }, [])

  const isFavorite = useCallback(
    (productId: string) => favorites.includes(productId),
    [favorites]
  )

  const cartCount = items.reduce((sum, i) => sum + i.quantity, 0)
  const subtotal = items.reduce((sum, i) => sum + i.product.price * i.quantity, 0)

  return (
    <CartContext.Provider
      value={{
        items,
        favorites,
        addToCart,
        removeFromCart,
        updateQuantity,
        removeMany,
        clearCart,
        toggleFavorite,
        isFavorite,
        cartCount,
        subtotal,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}
