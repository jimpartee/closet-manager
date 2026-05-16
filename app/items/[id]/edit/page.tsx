import { BASE_URL } from '@/lib/base-url'
import { notFound } from 'next/navigation'
import { Item, Location, Bag } from '@/lib/types'
import { ItemForm } from '../../item-form'

async function getItem(id: string): Promise<Item | null> {
  try {
    const res = await fetch(`${BASE_URL}/api/items/${id}`, { cache: 'no-store' })
    if (!res.ok) return null
    return res.json()
  } catch {
    return null
  }
}

async function getLocationsAndBags(): Promise<{ locations: Location[]; bags: Bag[] }> {
  try {
    const res = await fetch(BASE_URL + '/api/locations', { cache: 'no-store' })
    if (!res.ok) return { locations: [], bags: [] }
    return res.json()
  } catch {
    return { locations: [], bags: [] }
  }
}

export default async function EditItemPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const [item, { locations, bags }] = await Promise.all([
    getItem(id),
    getLocationsAndBags(),
  ])

  if (!item) notFound()

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Edit Item</h1>
        <p className="text-sm text-gray-500 mt-1">{item.name}</p>
      </div>
      <ItemForm
        locations={locations}
        bags={bags}
        defaultValues={item}
        itemId={id}
      />
    </div>
  )
}
