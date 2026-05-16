import { Item } from '@/lib/types'
import { NewDonationForm } from './new-donation-form'

async function getActiveItems(): Promise<Item[]> {
  try {
    const res = await fetch('http://localhost:3000/api/items', { cache: 'no-store' })
    if (!res.ok) return []
    const items: Item[] = await res.json()
    return items.filter((i) => i.status === 'active')
  } catch {
    return []
  }
}

export default async function NewDonationPage() {
  const items = await getActiveItems()

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">New Donation</h1>
        <p className="text-sm text-gray-500 mt-1">Record items you are donating</p>
      </div>
      <NewDonationForm items={items} />
    </div>
  )
}
