export interface Product {
  id: string
  name: string
  price: number
  image: string
  category: string
  subcategory?: string
  description: string
  colors: { name: string; hex: string }[]
  sizes: string[]
}

export interface CartItem {
  product: Product
  color: string
  size: string
  quantity: number
}

export interface Category {
  id: string
  name: string
  image: string
  featured?: boolean
}
