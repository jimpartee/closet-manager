import { BASE_URL } from '@/lib/base-url'
import { Item } from '@/lib/types'
import { WashingMachine, Shirt } from 'lucide-react'
import { ItemCard } from '@/components/item-card'
import { NoScrubsCTA } from './noscrubs-cta'

async function getHamperItems(): Promise<Item[]> {
  try {
    const res = await fetch(BASE_URL + '/api/items', { cache: 'no-store' })
    if (!res.ok) return []
    const items: Item[] = await res.json()
    return items.filter(
      (item) =>
        item.location?.name === 'Laundry Hamper' &&
        item.cleanliness === 'dirty' &&
        item.status === 'active'
    )
  } catch {
    return []
  }
}

export default async function LaundryPage() {
  const hamperItems = await getHamperItems()

  const byCategory = hamperItems.reduce<Record<string, number>>((acc, item) => {
    const cat = item.category || 'Other'
    acc[cat] = (acc[cat] || 0) + 1
    return acc
  }, {})

  return (
    <div className="p-4 md:p-8 pb-mobile-nav">
      {/* Header */}
      <div className="flex items-start justify-between mb-6 md:mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Laundry</h1>
          <p className="text-sm text-pink-400 mt-1 font-medium">
            {hamperItems.length === 0
              ? 'Your hamper is empty'
              : `${hamperItems.length} ${hamperItems.length === 1 ? 'item' : 'items'} waiting to be washed`}
          </p>
        </div>
        <div className="rounded-xl bg-gradient-to-br from-teal-400 to-cyan-500 p-2.5 shadow-sm shadow-teal-200">
          <WashingMachine className="h-5 w-5 text-white" />
        </div>
      </div>

      {hamperItems.length === 0 ? (
        /* Empty state */
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="rounded-2xl bg-gray-50 p-6 mb-4">
            <WashingMachine className="h-12 w-12 text-gray-300" />
          </div>
          <p className="text-gray-500 font-medium mb-1">Your laundry hamper is empty</p>
          <p className="text-sm text-gray-400 max-w-xs">
            After wearing an outfit, mark items as dirty and they'll appear here ready to send to NoScrubs.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {/* Hamper summary card */}
          <div className="rounded-2xl border border-pink-100 bg-white shadow-sm p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="rounded-lg bg-pink-50 p-2">
                <Shirt className="h-4 w-4 text-pink-500" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">Laundry Hamper</p>
                <p className="text-xs text-gray-400">Items marked dirty and awaiting wash</p>
              </div>
              <span className="ml-auto rounded-full bg-pink-100 px-3 py-1 text-xs font-semibold text-pink-600">
                {hamperItems.length} {hamperItems.length === 1 ? 'item' : 'items'}
              </span>
            </div>

            {/* Category breakdown */}
            {Object.keys(byCategory).length > 0 && (
              <div className="flex flex-wrap gap-2">
                {Object.entries(byCategory).map(([cat, count]) => (
                  <span
                    key={cat}
                    className="inline-flex items-center gap-1 rounded-full bg-gray-50 border border-gray-100 px-3 py-1 text-xs text-gray-600 font-medium"
                  >
                    {cat}
                    <span className="rounded-full bg-gray-200 px-1.5 py-0.5 text-[10px] text-gray-700 font-bold">
                      {count}
                    </span>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Items grid */}
          <div>
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
              In the Hamper
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {hamperItems.map((item) => (
                <ItemCard key={item.id} item={item} />
              ))}
            </div>
          </div>

          {/* NoScrubs CTA */}
          <div>
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
              Laundry Service
            </h2>
            <NoScrubsCTA itemCount={hamperItems.length} />
          </div>
        </div>
      )}
    </div>
  )
}
