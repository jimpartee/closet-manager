import { BASE_URL } from '@/lib/base-url'
import Link from 'next/link'
import { Plus } from 'lucide-react'
import { Item } from '@/lib/types'
import { ItemFilters } from './item-filters'
import { FillPhotosButton } from './fill-photos-button'

async function getItems(): Promise<Item[]> {
  try {
    const res = await fetch(BASE_URL + '/api/items', { cache: 'no-store' })
    if (!res.ok) return []
    return res.json()
  } catch {
    return []
  }
}

export default async function ItemsPage() {
  const items = await getItems()
  const missingPhotos = items.filter(i => !i.image_url).length

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Wardrobe</h1>
          <p className="text-sm text-gray-500 mt-1">{items.length} items total</p>
        </div>
        <div className="flex items-center gap-3">
          <FillPhotosButton missingCount={missingPhotos} />
          <Link
            href="/items/new"
            className="flex items-center gap-2 rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Add Item
          </Link>
        </div>
      </div>

      <ItemFilters items={items} />
    </div>
  )
}
