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
    <div className="p-4 md:p-8">
      <div className="flex flex-col gap-3 mb-6 sm:flex-row sm:items-start sm:justify-between sm:mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Wardrobe</h1>
          <p className="text-sm text-pink-400 mt-1 font-medium">{items.length} items in your collection</p>
        </div>
        <div className="flex items-center gap-2.5">
          <FillPhotosButton missingCount={missingPhotos} />
          <Link
            href="/items/new"
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-pink-500 to-pink-600 px-4 py-2.5 text-sm font-semibold text-white hover:from-pink-600 hover:to-pink-700 transition-all shadow-sm shadow-pink-200"
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
