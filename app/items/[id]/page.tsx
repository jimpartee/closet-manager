import { BASE_URL } from '@/lib/base-url'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import {
  Edit,
  ExternalLink,
  MapPin,
  Tag,
  Calendar,
  DollarSign,
  Shirt,
  Package,
} from 'lucide-react'
import { Item, PriceAlert } from '@/lib/types'
import { DeleteItemButton } from './delete-item-button'
import { PriceAlertSection } from './price-alert-section'
import { FetchPhotoButton } from './fetch-photo-button'
import { format } from 'date-fns'

async function getItem(id: string): Promise<Item | null> {
  try {
    const res = await fetch(`${BASE_URL}/api/items/${id}`, { cache: 'no-store' })
    if (!res.ok) return null
    return res.json()
  } catch {
    return null
  }
}

async function getPriceAlerts(itemId: string): Promise<PriceAlert[]> {
  try {
    const res = await fetch(
      `${BASE_URL}/api/price-alerts?item_id=${itemId}`,
      { cache: 'no-store' }
    )
    if (!res.ok) return []
    return res.json()
  } catch {
    return []
  }
}

export default async function ItemDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const [item, alerts] = await Promise.all([getItem(id), getPriceAlerts(id)])

  if (!item) notFound()

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-4 md:mb-6">
        <Link href="/items" className="text-sm text-gray-500 hover:text-gray-700">
          ← Back to Wardrobe
        </Link>
        <div className="flex gap-2">
          <Link
            href={`/items/${id}/edit`}
            className="flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <Edit className="h-4 w-4" />
            <span className="hidden sm:inline">Edit</span>
          </Link>
          <DeleteItemButton itemId={id} />
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Image */}
        <div className="rounded-xl border border-gray-200 bg-white overflow-hidden aspect-square flex items-center justify-center">
          {item.image_url ? (
            <img
              src={item.image_url}
              alt={item.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="flex flex-col items-center gap-3 text-gray-300">
              <Shirt className="h-16 w-16" />
              <p className="text-sm">No photo</p>
              {item.product_url && (
                <div className="mt-2">
                  <FetchPhotoButton itemId={id} />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Details */}
        <div className="space-y-5">
          <div>
            {item.brand && (
              <p className="text-sm font-medium text-violet-600 uppercase tracking-wide mb-1">
                {item.brand}
              </p>
            )}
            <h1 className="text-2xl font-semibold text-gray-900">{item.name}</h1>
            <div className="flex flex-wrap gap-2 mt-3">
              {item.category && (
                <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-700">
                  <Tag className="h-3 w-3" />
                  {item.category}
                </span>
              )}
              {item.color && (
                <span className="inline-flex items-center rounded-full bg-violet-50 px-3 py-1 text-sm text-violet-700">
                  {item.color}
                </span>
              )}
              {item.size && (
                <span className="inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-sm text-blue-700">
                  Size {item.size}
                </span>
              )}
              <span
                className={`inline-flex items-center rounded-full px-3 py-1 text-sm ${
                  item.status === 'donated'
                    ? 'bg-amber-50 text-amber-700'
                    : 'bg-green-50 text-green-700'
                }`}
              >
                {item.status === 'donated' ? 'Donated' : 'Active'}
              </span>
              <span
                className={`inline-flex items-center rounded-full px-3 py-1 text-xs ${
                  item.source === 'email_scan'
                    ? 'bg-blue-50 text-blue-600'
                    : 'bg-gray-100 text-gray-500'
                }`}
              >
                {item.source === 'email_scan' ? 'From Email' : 'Manual'}
              </span>
            </div>
          </div>

          {/* Metadata */}
          <div className="rounded-xl border border-gray-100 bg-gray-50 p-4 space-y-3">
            {item.purchase_price && (
              <div className="flex items-center gap-3">
                <DollarSign className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-700">
                  ${item.purchase_price.toFixed(2)}
                </span>
              </div>
            )}
            {item.purchase_date && (
              <div className="flex items-center gap-3">
                <Calendar className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-700">
                  {format(new Date(item.purchase_date), 'MMMM d, yyyy')}
                </span>
              </div>
            )}
            {(item.location || item.bag) && (
              <div className="flex items-center gap-3">
                <MapPin className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-700">
                  {item.bag ? item.bag.name : item.location?.name}
                </span>
              </div>
            )}
            {item.product_url && (
              <div className="flex items-center gap-3">
                <ExternalLink className="h-4 w-4 text-gray-400" />
                <a
                  href={item.product_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-violet-600 hover:text-violet-700 truncate max-w-xs"
                >
                  View product
                </a>
              </div>
            )}
            {item.notes && (
              <div className="flex items-start gap-3">
                <Package className="h-4 w-4 text-gray-400 mt-0.5" />
                <p className="text-sm text-gray-700">{item.notes}</p>
              </div>
            )}
          </div>

          {/* Price Alerts */}
          <PriceAlertSection
            itemId={id}
            productUrl={item.product_url}
            alerts={alerts}
          />
        </div>
      </div>
    </div>
  )
}
