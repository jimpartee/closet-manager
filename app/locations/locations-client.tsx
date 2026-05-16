'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Plus, MapPin, Package, Shirt, Loader2 } from 'lucide-react'
import { Location, Bag, Item } from '@/lib/types'
import { toast } from 'sonner'

interface LocationsClientProps {
  locations: Location[]
  bags: Bag[]
  items: Item[]
}

function AddDialog({
  type,
  onClose,
  onSuccess,
}: {
  type: 'location' | 'bag'
  onClose: () => void
  onSuccess: () => void
}) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    setSaving(true)
    try {
      const url = type === 'location' ? '/api/locations' : '/api/bags'
      const body =
        type === 'location'
          ? { name, description, type: 'room' }
          : { name, description }
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (!res.ok) throw new Error('Failed to create')
      toast.success(`${type === 'location' ? 'Location' : 'Bag'} added!`)
      onSuccess()
    } catch {
      toast.error('Failed to create')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl p-6 w-full max-w-sm shadow-xl">
        <h2 className="text-lg font-semibold mb-4">
          Add {type === 'location' ? 'Location' : 'Bag'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
              placeholder={type === 'location' ? 'e.g. Walk-in Closet' : 'e.g. Travel Bag'}
              autoFocus
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
              placeholder="Optional"
            />
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-lg border border-gray-200 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || !name.trim()}
              className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-violet-600 py-2 text-sm font-medium text-white hover:bg-violet-700 disabled:opacity-50"
            >
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}
              Add
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export function LocationsClient({ locations, bags, items }: LocationsClientProps) {
  const router = useRouter()
  const [dialog, setDialog] = useState<'location' | 'bag' | null>(null)

  const rooms = locations.filter((l) => l.type === 'room')

  const getLocationItems = (locationId: string) =>
    items.filter((i) => i.location_id === locationId && !i.bag_id)

  const getBagItems = (bagId: string) => items.filter((i) => i.bag_id === bagId)

  const handleSuccess = () => {
    setDialog(null)
    router.refresh()
  }

  return (
    <div>
      {dialog && (
        <AddDialog
          type={dialog}
          onClose={() => setDialog(null)}
          onSuccess={handleSuccess}
        />
      )}

      {/* Rooms Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-medium text-gray-900 flex items-center gap-2">
            <MapPin className="h-5 w-5 text-gray-400" />
            Rooms &amp; Storage
          </h2>
          <button
            onClick={() => setDialog('location')}
            className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Add Location
          </button>
        </div>

        {rooms.length === 0 ? (
          <p className="text-sm text-gray-400">No locations yet.</p>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {rooms.map((loc) => {
              const locItems = getLocationItems(loc.id)
              return (
                <div
                  key={loc.id}
                  className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-medium text-gray-900">{loc.name}</h3>
                      {loc.description && (
                        <p className="text-xs text-gray-500 mt-0.5">{loc.description}</p>
                      )}
                    </div>
                    <span className="text-xs text-gray-400 bg-gray-100 rounded-full px-2 py-0.5">
                      {locItems.length} items
                    </span>
                  </div>

                  {locItems.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {locItems.slice(0, 6).map((item) => (
                        <Link key={item.id} href={`/items/${item.id}`}>
                          <div className="h-10 w-10 rounded-lg bg-gray-100 overflow-hidden border border-gray-200 hover:border-violet-300 transition-colors">
                            {item.image_url ? (
                              <img
                                src={item.image_url}
                                alt={item.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Shirt className="h-4 w-4 text-gray-400" />
                              </div>
                            )}
                          </div>
                        </Link>
                      ))}
                      {locItems.length > 6 && (
                        <Link
                          href={`/items?location=${loc.id}`}
                          className="h-10 w-10 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center text-xs text-gray-500 hover:bg-gray-200"
                        >
                          +{locItems.length - 6}
                        </Link>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Bags Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-medium text-gray-900 flex items-center gap-2">
            <Package className="h-5 w-5 text-gray-400" />
            Bags
          </h2>
          <button
            onClick={() => setDialog('bag')}
            className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Add Bag
          </button>
        </div>

        {bags.length === 0 ? (
          <p className="text-sm text-gray-400">No bags yet.</p>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {bags.map((bag) => {
              const bagItems = getBagItems(bag.id)
              return (
                <div
                  key={bag.id}
                  className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-medium text-gray-900">{bag.name}</h3>
                      {bag.description && (
                        <p className="text-xs text-gray-500 mt-0.5">{bag.description}</p>
                      )}
                    </div>
                    <span className="text-xs text-gray-400 bg-gray-100 rounded-full px-2 py-0.5">
                      {bagItems.length} items
                    </span>
                  </div>

                  {bagItems.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {bagItems.slice(0, 6).map((item) => (
                        <Link key={item.id} href={`/items/${item.id}`}>
                          <div className="h-10 w-10 rounded-lg bg-gray-100 overflow-hidden border border-gray-200 hover:border-violet-300 transition-colors">
                            {item.image_url ? (
                              <img
                                src={item.image_url}
                                alt={item.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Shirt className="h-4 w-4 text-gray-400" />
                              </div>
                            )}
                          </div>
                        </Link>
                      ))}
                      {bagItems.length > 6 && (
                        <div className="h-10 w-10 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center text-xs text-gray-500">
                          +{bagItems.length - 6}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
