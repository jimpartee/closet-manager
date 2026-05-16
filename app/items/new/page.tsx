import { BASE_URL } from '@/lib/base-url'
import { ItemForm } from '../item-form'

async function getLocationsAndBags() {
  try {
    const res = await fetch(BASE_URL + '/api/locations', { cache: 'no-store' })
    if (!res.ok) return { locations: [], bags: [] }
    return res.json()
  } catch {
    return { locations: [], bags: [] }
  }
}

export default async function NewItemPage() {
  const { locations, bags } = await getLocationsAndBags()

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Add New Item</h1>
        <p className="text-sm text-gray-500 mt-1">Add a new item to your wardrobe</p>
      </div>
      <ItemForm locations={locations} bags={bags} />
    </div>
  )
}
