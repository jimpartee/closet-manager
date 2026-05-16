import { BASE_URL } from '@/lib/base-url'
import { Location, Bag, Item } from '@/lib/types'
import { LocationsClient } from './locations-client'

async function getData() {
  try {
    const [locRes, itemsRes] = await Promise.all([
      fetch(BASE_URL + '/api/locations', { cache: 'no-store' }),
      fetch(BASE_URL + '/api/items', { cache: 'no-store' }),
    ])
    const { locations, bags } = locRes.ok ? await locRes.json() : { locations: [], bags: [] }
    const items: Item[] = itemsRes.ok ? await itemsRes.json() : []
    return { locations, bags, items }
  } catch {
    return { locations: [] as Location[], bags: [] as Bag[], items: [] as Item[] }
  }
}

export default async function LocationsPage() {
  const { locations, bags, items } = await getData()

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Locations</h1>
        <p className="text-sm text-gray-500 mt-1">Manage where your items are stored</p>
      </div>
      <LocationsClient locations={locations} bags={bags} items={items} />
    </div>
  )
}
