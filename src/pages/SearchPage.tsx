import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, Search, X } from 'lucide-react'
import { AppLayout } from '../components/AppLayout'
import { CategoryIcon } from '../components/CategoryIcon'
import { ProductCard } from '../components/ProductCard'
import { AnimateIn } from '../components/AnimateIn'
import { categories, products, searchCategories, searchProducts } from '../data/mockData'

const RECENT_KEY = 'dara_recent_searches'
const MAX_RECENT = 6

function loadRecent(): string[] {
  try {
    const raw = localStorage.getItem(RECENT_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function saveRecent(list: string[]) {
  try {
    localStorage.setItem(RECENT_KEY, JSON.stringify(list))
  } catch {
    // ignore write failures (e.g. private browsing)
  }
}

export function SearchPage() {
  const navigate = useNavigate()
  const inputRef = useRef<HTMLInputElement>(null)
  const [query, setQuery] = useState('')
  const [recent, setRecent] = useState<string[]>(() => loadRecent())

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const trimmed = query.trim()
  const results = trimmed ? searchProducts(trimmed) : []
  const matchingCategories = trimmed ? searchCategories(trimmed) : []
  const trending = products.slice(0, 6)

  const commitSearch = (value: string) => {
    const v = value.trim()
    if (!v) return
    setRecent((prev) => {
      const next = [v, ...prev.filter((r) => r.toLowerCase() !== v.toLowerCase())].slice(
        0,
        MAX_RECENT
      )
      saveRecent(next)
      return next
    })
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      commitSearch(query)
      inputRef.current?.blur()
    }
  }

  const handleRecentClick = (term: string) => {
    setQuery(term)
    commitSearch(term)
  }

  const handleClearRecent = () => {
    setRecent([])
    saveRecent([])
  }

  const handleClearQuery = () => {
    setQuery('')
    inputRef.current?.focus()
  }

  return (
    <AppLayout showNav={false}>
      <header className="sticky top-0 z-40 flex items-center gap-2 bg-white px-4 py-3">
        <button
          onClick={() => navigate(-1)}
          className="press-scale shrink-0 p-1 text-dara-charcoal"
          aria-label="Back"
        >
          <ArrowLeft size={22} strokeWidth={1.5} />
        </button>
        <div className="relative flex-1">
          <Search
            size={16}
            strokeWidth={1.5}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search products, categories..."
            className="h-10 w-full rounded-dara border border-dara-gray-dark bg-dara-gray pl-9 pr-9 text-sm text-dara-charcoal outline-none transition-colors focus:border-dara-charcoal focus:bg-white"
          />
          {query && (
            <button
              onClick={handleClearQuery}
              className="press-scale absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-400"
              aria-label="Clear search"
            >
              <X size={14} />
            </button>
          )}
        </div>
      </header>

      <div className="pb-10">
        {!trimmed ? (
          <>
            {recent.length > 0 && (
              <AnimateIn animation="fade-up">
                <section className="px-4 pt-4">
                  <div className="mb-3 flex items-center justify-between">
                    <h3 className="text-xs font-semibold tracking-wider text-gray-500">
                      RECENT SEARCHES
                    </h3>
                    <button
                      onClick={handleClearRecent}
                      className="press-scale text-xs font-medium text-dara-tan transition-colors hover:text-dara-tan-dark"
                    >
                      Clear
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {recent.map((term) => (
                      <button
                        key={term}
                        onClick={() => handleRecentClick(term)}
                        className="press-scale rounded-full border border-dara-gray-dark px-3 py-1.5 text-xs text-dara-charcoal transition-colors hover:border-dara-tan hover:text-dara-tan"
                      >
                        {term}
                      </button>
                    ))}
                  </div>
                </section>
              </AnimateIn>
            )}

            <AnimateIn animation="fade-up" delay={recent.length > 0 ? 100 : 0}>
              <section className="px-4 pt-5">
                <h3 className="mb-3 text-xs font-semibold tracking-wider text-gray-500">
                  BROWSE CATEGORIES
                </h3>
                <div className="grid grid-cols-4 gap-4">
                  {categories.map((cat, i) => (
                    <CategoryIcon
                      key={cat.id}
                      id={cat.id}
                      name={cat.name}
                      to={`/products/${cat.id}`}
                      index={i}
                    />
                  ))}
                </div>
              </section>
            </AnimateIn>

            <AnimateIn animation="fade-up" delay={recent.length > 0 ? 200 : 100}>
              <section className="mt-6 px-4">
                <h3 className="mb-3 text-xs font-semibold tracking-wider text-gray-500">
                  TRENDING NOW
                </h3>
                <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2">
                  {trending.map((product, i) => (
                    <ProductCard key={product.id} product={product} variant="scroll" index={i} />
                  ))}
                </div>
              </section>
            </AnimateIn>
          </>
        ) : results.length > 0 ? (
          <>
            <p className="px-4 pt-4 text-xs text-gray-500">
              {results.length} {results.length === 1 ? 'result' : 'results'} for &quot;
              <span className="font-medium text-dara-charcoal">{trimmed}</span>&quot;
            </p>
            <div className="grid grid-cols-2 gap-3 p-4" key={trimmed}>
              {results.map(({ product, matchedColors }, i) => (
                <div key={product.id} onClickCapture={() => commitSearch(trimmed)}>
                  <ProductCard
                    product={product}
                    index={i}
                    tag={matchedColors.length > 0 ? `Also available in ${matchedColors.join(', ')}` : undefined}
                  />
                </div>
              ))}
            </div>
          </>
        ) : (
          <AnimateIn
            animation="fade-in"
            className="flex flex-col items-center px-6 py-16 text-center"
          >
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-dara-gray">
              <Search size={26} strokeWidth={1.2} className="text-gray-300" />
            </div>
            <p className="text-sm text-gray-500">
              No results for &quot;<span className="font-medium text-dara-charcoal">{trimmed}</span>&quot;
            </p>
            <p className="mt-1 text-xs text-gray-400">
              Try a different keyword or browse a category below
            </p>
            {matchingCategories.length > 0 && (
              <div className="mt-5 flex flex-wrap justify-center gap-2">
                {matchingCategories.map((cat) => (
                  <Link
                    key={cat.id}
                    to={`/products/${cat.id}`}
                    className="press-scale rounded-full border border-dara-tan bg-dara-tan/10 px-4 py-2 text-xs font-medium text-dara-tan-dark transition-colors hover:bg-dara-tan/20"
                  >
                    Browse {cat.name}
                  </Link>
                ))}
              </div>
            )}
          </AnimateIn>
        )}
      </div>
    </AppLayout>
  )
}
