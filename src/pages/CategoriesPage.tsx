import { Link } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import { AppLayout } from '../components/AppLayout'
import { PageHeader } from '../components/PageHeader'
import { AnimateIn } from '../components/AnimateIn'
import { categories } from '../data/mockData'

export function CategoriesPage() {
  const featured = categories.filter((c) => c.featured)
  const secondary = categories.filter((c) => !c.featured)

  return (
    <AppLayout>
      <PageHeader title="Categories" backTo="/home" showSearch />

      <div className="px-4 pb-6">
        <div className="space-y-3">
          {featured.map((cat, i) => (
            <AnimateIn key={cat.id} animation="slide-right" delay={i * 100}>
              <Link
                to={`/products/${cat.id}`}
                className="press-scale group relative flex h-28 items-center overflow-hidden rounded-dara bg-dara-gray"
              >
                <div className="relative z-10 flex flex-1 flex-col justify-center pl-5">
                  <h3 className="font-serif text-xl font-medium transition-colors group-hover:text-dara-tan">
                    {cat.name}
                  </h3>
                  <span className="mt-1 flex items-center gap-1 text-xs font-medium text-dara-tan transition-transform duration-300 group-hover:translate-x-1">
                    Explore Now
                    <ChevronRight size={14} />
                  </span>
                </div>
                <div className="absolute right-0 top-0 h-full w-1/2 overflow-hidden">
                  <img
                    src={cat.image}
                    alt={cat.name}
                    className="h-full w-full object-cover object-top transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-dara-gray via-dara-gray/60 to-transparent" />
                </div>
              </Link>
            </AnimateIn>
          ))}
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3">
          {secondary.map((cat, i) => (
            <AnimateIn key={cat.id} animation="scale-in" delay={400 + i * 80}>
              <Link
                to={`/products/${cat.id}`}
                className="press-scale group relative block aspect-[4/3] overflow-hidden rounded-dara bg-dara-gray"
              >
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="h-full w-full object-cover object-top transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent transition-opacity group-hover:from-black/60" />
                <h3 className="absolute bottom-3 left-3 font-serif text-base font-medium text-white transition-transform duration-300 group-hover:translate-y-[-2px]">
                  {cat.name}
                </h3>
              </Link>
            </AnimateIn>
          ))}
        </div>

        <AnimateIn animation="fade-up" delay={700}>
          <Link
            to="/products/shirts"
            className="btn-shimmer press-scale mt-6 block w-full rounded-dara bg-dara-charcoal py-3.5 text-center text-xs font-semibold tracking-wider text-white transition-colors hover:bg-black"
          >
            VIEW ALL PRODUCTS
          </Link>
        </AnimateIn>
      </div>
    </AppLayout>
  )
}
