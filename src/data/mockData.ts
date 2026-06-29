import type { Category, Product } from '../types'

export const categories: Category[] = [
  {
    id: 'shirts',
    name: 'Shirts',
    image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600&q=80',
    featured: true,
  },
  {
    id: 'pants',
    name: 'Pants',
    image: 'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=600&q=80',
    featured: true,
  },
  {
    id: 't-shirts',
    name: 'T-Shirts',
    image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&q=80',
    featured: true,
  },
  {
    id: 'trousers',
    name: 'Trousers',
    image: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=600&q=80',
    featured: true,
  },
  {
    id: 'watches',
    name: 'Watches',
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&q=80',
  },
  {
    id: 'abayas',
    name: 'Abayas',
    image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=400&q=80',
  },
  {
    id: 'hijabs',
    name: 'Hijabs',
    image: 'https://images.unsplash.com/photo-1610030469663-0d3b8a3b8b8b?w=400&q=80',
  },
  {
    id: 'shoes',
    name: 'Shoes',
    image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&q=80',
  },
]

export const products: Product[] = [
  {
    id: '1',
    name: 'White Textured Shirt',
    price: 5990,
    image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600&q=80',
    category: 'shirts',
    subcategory: 'casual',
    description:
      'Crafted from premium cotton with a subtle textured weave. This versatile white shirt pairs effortlessly with both casual and formal looks.',
    colors: [
      { name: 'White', hex: '#FFFFFF' },
      { name: 'Black', hex: '#1A1A1A' },
      { name: 'Navy', hex: '#1B2A4A' },
    ],
    sizes: ['S', 'M', 'L', 'XL'],
  },
  {
    id: '2',
    name: 'Black Classic Shirt',
    price: 7990,
    image: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=600&q=80',
    category: 'shirts',
    subcategory: 'formal',
    description:
      'A timeless black shirt tailored for the modern gentleman. Premium fabric with a refined fit that transitions seamlessly from office to evening.',
    colors: [
      { name: 'Black', hex: '#1A1A1A' },
      { name: 'White', hex: '#FFFFFF' },
      { name: 'Navy', hex: '#1B2A4A' },
      { name: 'Brown', hex: '#6B4423' },
    ],
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
  },
  {
    id: '3',
    name: 'Embroidered Luxury Shirt',
    price: 12990,
    image: 'https://images.unsplash.com/photo-1603252109303-2751441dd157?w=600&q=80',
    category: 'shirts',
    subcategory: 'luxury-pret',
    description:
      'Hand-embroidered details on premium lawn fabric. A statement piece from our Luxury Pret collection, perfect for festive occasions.',
    colors: [
      { name: 'Black', hex: '#1A1A1A' },
      { name: 'White', hex: '#FFFFFF' },
    ],
    sizes: ['S', 'M', 'L', 'XL'],
  },
  {
    id: '4',
    name: 'Casual Linen Shirt',
    price: 4490,
    image: 'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=600&q=80',
    category: 'shirts',
    subcategory: 'casual',
    description:
      'Breathable linen blend for Pakistan\'s warm climate. Relaxed fit with mother-of-pearl buttons for an understated elegance.',
    colors: [
      { name: 'Beige', hex: '#D4C5A9' },
      { name: 'White', hex: '#FFFFFF' },
      { name: 'Navy', hex: '#1B2A4A' },
    ],
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
  },
  {
    id: '5',
    name: 'Formal Oxford Shirt',
    price: 6990,
    image: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=600&q=80',
    category: 'shirts',
    subcategory: 'formal',
    description:
      'Classic Oxford weave in a crisp tailored cut. The perfect foundation for your professional wardrobe.',
    colors: [
      { name: 'White', hex: '#FFFFFF' },
      { name: 'Light Blue', hex: '#B8D4E8' },
    ],
    sizes: ['S', 'M', 'L', 'XL'],
  },
  {
    id: '6',
    name: 'Printed Pret Shirt',
    price: 8990,
    image: 'https://images.unsplash.com/photo-1564257631407-4deb1f99d992?w=600&q=80',
    category: 'shirts',
    subcategory: 'luxury-pret',
    description:
      'Contemporary print on premium cotton lawn. A fusion of traditional motifs with modern silhouettes.',
    colors: [
      { name: 'Multi', hex: '#C5A377' },
      { name: 'Black', hex: '#1A1A1A' },
    ],
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
  },
]

export const shirtTabs = ['All', 'Casual', 'Formal', 'Luxury Pret'] as const

export function formatPrice(price: number): string {
  return `PKR ${price.toLocaleString('en-PK')}`
}

export function getProductsByCategory(categoryId: string, tab?: string): Product[] {
  let filtered = products.filter((p) => p.category === categoryId)
  if (tab && tab !== 'All') {
    const sub = tab.toLowerCase().replace(' ', '-')
    filtered = filtered.filter((p) => p.subcategory === sub)
  }
  return filtered
}
