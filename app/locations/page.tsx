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
    <div className="p-4 md:p-8 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Locations</h1>
        <p className="text-sm text-pink-400 mt-1 font-medium">Where everything lives</p>
      </div>
      <LocationsClient locations={locations} bags={bags} items={items} />
    </div>
  )
}
