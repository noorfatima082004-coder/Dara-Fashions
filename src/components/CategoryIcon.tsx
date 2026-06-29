import {
  Shirt,
  Columns2,
  CircleDot,
  Watch,
  Moon,
  Sparkles,
  Footprints,
  Grid3X3,
} from 'lucide-react'
import { Link } from 'react-router-dom'

const categoryIcons: Record<string, React.ElementType> = {
  shirts: Shirt,
  pants: Columns2,
  't-shirts': CircleDot,
  trousers: Columns2,
  watches: Watch,
  abayas: Moon,
  hijabs: Sparkles,
  shoes: Footprints,
}

interface CategoryIconProps {
  id: string
  name: string
  to?: string
  index?: number
}

export function CategoryIcon({ id, name, to, index = 0 }: CategoryIconProps) {
  const Icon = categoryIcons[id] || Grid3X3
  const content = (
    <div
      className="group flex flex-col items-center gap-2"
      style={{
        animation: `anim-scale-in 0.4s cubic-bezier(0.22, 1, 0.36, 1) ${Math.min(index * 40, 200)}ms forwards`,
        opacity: 0,
      }}
    >
      <div className="flex h-14 w-14 items-center justify-center rounded-dara bg-dara-gray transition-all duration-300 group-hover:bg-dara-tan/15 group-hover:shadow-md group-active:scale-95">
        <Icon
          size={22}
          strokeWidth={1.2}
          className="text-dara-charcoal transition-transform duration-300 group-hover:scale-110"
        />
      </div>
      <span className="text-[11px] font-medium text-dara-charcoal transition-colors group-hover:text-dara-tan">
        {name}
      </span>
    </div>
  )

  if (to) {
    return <Link to={to}>{content}</Link>
  }
  return content
}
