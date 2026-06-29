import { AppLayout } from '../components/AppLayout'
import { PageHeader } from '../components/PageHeader'
import { ProductCard } from '../components/ProductCard'
import { AnimateIn } from '../components/AnimateIn'
import { products } from '../data/mockData'
import { useCart } from '../context/CartContext'

export function FavoritesPage() {
  const { favorites } = useCart()
  const favoriteProducts = products.filter((p) => favorites.includes(p.id))

  return (
    <AppLayout>
      <PageHeader title="Favorites" backTo="/home" />
      {favoriteProducts.length > 0 ? (
        <div className="grid grid-cols-2 gap-3 p-4">
          {favoriteProducts.map((product, i) => (
            <ProductCard key={product.id} product={product} index={i} />
          ))}
        </div>
      ) : (
        <AnimateIn animation="scale-in" className="flex flex-col items-center py-20">
          <p className="text-sm text-gray-400">No favorites yet</p>
        </AnimateIn>
      )}
    </AppLayout>
  )
}
