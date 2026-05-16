import Link from 'next/link'
import { Check, Shirt } from 'lucide-react'
import { Item } from '@/lib/types'

interface ItemCardProps {
  item: Item
  selectable?: boolean
  selected?: boolean
  onToggle?: () => void
}

export function ItemCard({ item, selectable, selected, onToggle }: ItemCardProps) {
  const inner = (
    <div
      className={`group rounded-xl border bg-white shadow-sm hover:shadow-md transition-shadow overflow-hidden cursor-pointer relative ${
        selected ? 'border-violet-400 ring-2 ring-violet-300' : 'border-gray-200'
      }`}
    >
      {selectable && (
        <div className="absolute top-2 left-2 z-10">
          <div
            className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
              selected ? 'bg-violet-600 border-violet-600' : 'bg-white/90 border-gray-300'
            }`}
          >
            {selected && <Check className="h-3 w-3 text-white" strokeWidth={3} />}
          </div>
        </div>
      )}

      {/* Image */}
      <div className="aspect-square bg-gray-50 flex items-center justify-center overflow-hidden">
        {item.image_url ? (
          <img
            src={item.image_url}
            alt={item.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <Shirt className="h-12 w-12 text-gray-300" />
        )}
      </div>

      {/* Info */}
      <div className="p-3">
        {item.brand && (
          <p className="text-xs text-gray-400 uppercase tracking-wide mb-0.5 truncate">
            {item.brand}
          </p>
        )}
        <p className="text-sm font-medium text-gray-900 truncate">{item.name}</p>
        <div className="flex flex-wrap gap-1 mt-2">
          {item.gender && (
            <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-xs text-emerald-700">
              {item.gender}
            </span>
          )}
          {item.color && (
            <span className="inline-flex items-center rounded-full bg-violet-50 px-2 py-0.5 text-xs text-violet-700">
              {item.color}
            </span>
          )}
          {item.size && (
            <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-0.5 text-xs text-blue-700">
              {item.size}
            </span>
          )}
          {item.status === 'donated' && (
            <span className="inline-flex items-center rounded-full bg-amber-50 px-2 py-0.5 text-xs text-amber-700">
              Donated
            </span>
          )}
        </div>
        {(item.location || item.bag) && (
          <p className="text-xs text-gray-400 mt-2 truncate">
            {item.bag ? item.bag.name : item.location?.name}
          </p>
        )}
      </div>
    </div>
  )

  if (selectable) {
    return (
      <div onClick={onToggle} className="select-none">
        {inner}
      </div>
    )
  }

  return <Link href={`/items/${item.id}`}>{inner}</Link>
}
