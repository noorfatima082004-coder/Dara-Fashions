import { Link } from 'react-router-dom'
import { Shield, Truck, Award } from 'lucide-react'
import { AppLayout } from '../components/AppLayout'
import { HomeHeader } from '../components/HomeHeader'
import { CategoryIcon } from '../components/CategoryIcon'
import { ProductCard } from '../components/ProductCard'
import { AnimateIn } from '../components/AnimateIn'
import { categories, products } from '../data/mockData'

const uspItems = [
  { icon: Award, label: 'PREMIUM QUALITY' },
  { icon: Shield, label: 'SECURE PAYMENTS' },
  { icon: Truck, label: 'FAST DELIVERY' },
]

export function HomePage() {
  const gridCategories = categories.slice(0, 8)
  const newArrivals = products.slice(0, 4)

  return (
    <AppLayout>
      <HomeHeader />

      {/* Hero */}
      <AnimateIn animation="blur-in" duration={500}>
        <section className="relative mx-4 mb-6 overflow-hidden rounded-dara">
          <div className="relative aspect-[4/5]">
            <img
              src="https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=900&q=85"
              alt="Luxury Pret Collection"
              className="hero-ken-burns h-full w-full object-cover object-top"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/25 to-black/10" />
            <div className="absolute bottom-0 left-0 p-5 text-white">
              <p className="hero-text-1 text-xs font-medium tracking-[0.2em] text-dara-tan">
                New Collection &apos;24
              </p>
              <h2 className="hero-text-2 mt-2 font-serif text-[1.75rem] font-medium leading-tight">
                Luxury Pret
                <br />
                Now Available
              </h2>
              <Link
                to="/categories"
                className="hero-text-3 btn-shimmer press-scale mt-5 inline-block rounded-dara bg-dara-tan px-7 py-3 text-xs font-semibold tracking-[0.15em] text-white shadow-lg shadow-black/20 transition-all hover:bg-dara-tan-dark hover:shadow-xl"
              >
                EXPLORE NOW
              </Link>
            </div>
          </div>
        </section>
      </AnimateIn>

      {/* Category Grid */}
      <section className="mb-6 px-4">
        <div className="grid grid-cols-4 gap-4">
          {gridCategories.map((cat, i) => (
            <CategoryIcon
              key={cat.id}
              id={cat.id}
              name={cat.name}
              to={`/products/${cat.id}`}
              index={i}
            />
          ))}
          <Link
            to="/categories"
            className="press-scale flex flex-col items-center gap-2"
            style={{
              animation: `anim-scale-in 0.5s cubic-bezier(0.22, 1, 0.36, 1) ${8 * 60}ms forwards`,
              opacity: 0,
            }}
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-dara bg-dara-charcoal transition-transform duration-300 hover:scale-105 active:scale-95">
              <span className="text-[10px] font-medium text-white">View All</span>
            </div>
            <span className="text-[11px] font-medium text-dara-charcoal">&nbsp;</span>
          </Link>
        </div>
      </section>

      {/* USP Bar */}
      <AnimateIn animation="slide-right" delay={200}>
        <section className="mb-6 bg-dara-charcoal px-4 py-4">
          <div className="flex items-center justify-between">
            {uspItems.map(({ icon: Icon, label }, i) => (
              <div
                key={label}
                className="flex flex-col items-center gap-1.5"
                style={{ animationDelay: `${i * 150}ms` }}
              >
                <Icon
                  size={18}
                  className="usp-icon-glow text-dara-tan"
                  strokeWidth={1.5}
                  style={{ animationDelay: `${i * 0.3}s` }}
                />
                <span className="text-[8px] font-medium tracking-wider text-white">
                  {label}
                </span>
              </div>
            ))}
          </div>
        </section>
      </AnimateIn>

      {/* New Arrivals */}
      <AnimateIn animation="fade-up" delay={100}>
        <section className="mb-4 px-4">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-serif text-lg font-medium">New Arrivals</h3>
            <Link
              to="/products/shirts"
              className="text-xs font-medium text-dara-tan transition-all hover:tracking-wider"
            >
              View All
            </Link>
          </div>
          <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2">
            {newArrivals.map((product, i) => (
              <ProductCard
                key={product.id}
                product={product}
                variant="scroll"
                index={i}
              />
            ))}
          </div>
        </section>
      </AnimateIn>
    </AppLayout>
  )
}
