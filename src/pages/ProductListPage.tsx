import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { SlidersHorizontal } from 'lucide-react'
import { AppLayout } from '../components/AppLayout'
import { PageHeader } from '../components/PageHeader'
import { ProductCard } from '../components/ProductCard'
import { AnimateIn } from '../components/AnimateIn'
import { categories, getProductsByCategory, shirtTabs } from '../data/mockData'

export function ProductListPage() {
  const { categoryId = 'shirts' } = useParams()
  const category = categories.find((c) => c.id === categoryId)
  const title = category?.name ?? 'Products'
  const [activeTab, setActiveTab] = useState<string>('All')
  const [sortOpen, setSortOpen] = useState(false)

  const filteredProducts = getProductsByCategory(categoryId, activeTab)

  return (
    <AppLayout showNav={false}>
      <PageHeader
        title={title}
        backTo="/categories"
        showSearch
        rightAction={
          <button className="press-scale p-1 text-dara-charcoal" aria-label="Filter">
            <SlidersHorizontal size={20} strokeWidth={1.5} />
          </button>
        }
      />

      {categoryId === 'shirts' && (
        <div className="border-b border-dara-gray-dark px-4">
          <div className="flex gap-6 overflow-x-auto scrollbar-hide">
            {shirtTabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`relative shrink-0 py-3 text-xs font-medium transition-colors duration-300 ${
                  activeTab === tab ? 'text-dara-charcoal' : 'text-gray-400'
                }`}
              >
                {tab}
                {activeTab === tab && (
                  <span className="tab-active-line absolute bottom-0 left-0 h-0.5 w-full bg-dara-charcoal" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex items-center justify-between border-b border-dara-gray-dark px-4 py-2.5">
        <button
          onClick={() => setSortOpen(!sortOpen)}
          className="press-scale text-xs font-medium text-gray-500 transition-colors hover:text-dara-charcoal"
        >
          Sort ▾
        </button>
        <button className="press-scale flex items-center gap-1 text-xs font-medium text-gray-500 transition-colors hover:text-dara-charcoal">
          <SlidersHorizontal size={14} />
          Filter
        </button>
      </div>

      <div
        className={`overflow-hidden transition-all duration-300 ease-out ${
          sortOpen ? 'max-h-32 opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="border-b border-dara-gray-dark bg-white px-4 py-2">
          {['Price: Low to High', 'Price: High to Low', 'Newest'].map((opt, i) => (
            <button
              key={opt}
              className="block w-full py-2 text-left text-xs text-gray-600 transition-colors hover:text-dara-tan"
              style={{
                animation: sortOpen
                  ? `anim-fade-up 0.3s ease-out ${i * 60}ms forwards`
                  : undefined,
                opacity: sortOpen ? 0 : undefined,
              }}
              onClick={() => setSortOpen(false)}
            >
              {opt}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 p-4" key={activeTab}>
        {filteredProducts.length > 0 ? (
          filteredProducts.map((product, i) => (
            <ProductCard key={product.id} product={product} index={i} />
          ))
        ) : (
          <AnimateIn animation="fade-in" className="col-span-2">
            <p className="py-12 text-center text-sm text-gray-400">
              No products found in this category.
            </p>
          </AnimateIn>
        )}
      </div>
    </AppLayout>
  )
}
