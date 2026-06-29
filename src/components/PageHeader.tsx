import { Link } from 'react-router-dom'
import { ArrowLeft, Search } from 'lucide-react'

interface PageHeaderProps {
  title: string
  backTo?: string
  rightAction?: React.ReactNode
  showSearch?: boolean
}

export function PageHeader({ title, backTo = '/home', rightAction, showSearch }: PageHeaderProps) {
  return (
    <header className="sticky top-0 z-40 flex items-center justify-between bg-white px-4 py-3">
      <Link to={backTo} className="p-1 text-dara-charcoal">
        <ArrowLeft size={22} strokeWidth={1.5} />
      </Link>
      <h1 className="font-serif text-lg font-medium">{title}</h1>
      <div className="flex min-w-[4rem] items-center justify-end gap-2">
        {showSearch && (
          <button className="p-1 text-dara-charcoal" aria-label="Search">
            <Search size={20} strokeWidth={1.5} />
          </button>
        )}
        {rightAction}
      </div>
    </header>
  )
}
