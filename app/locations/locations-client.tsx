'use client'

import { useState, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Plus, MapPin, Package, Shirt, Loader2, Camera, X } from 'lucide-react'
import { Location, Bag, Item } from '@/lib/types'
import { toast } from 'sonner'

interface LocationsClientProps {
  locations: Location[]
  bags: Bag[]
  items: Item[]
}

function PhotoUploadButton({
  onUpload,
  uploading,
}: {
  onUpload: (url: string) => void
  uploading: boolean
}) {
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFile = async (file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    const res = await fetch('/api/upload', { method: 'POST', body: formData })
    if (!res.ok) throw new Error('Upload failed')
    const { url } = await res.json()
    onUpload(url)
  }

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) handleFile(file)
        }}
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-50"
      >
        {uploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Camera className="h-3.5 w-3.5" />}
        {uploading ? 'Uploading…' : 'Add Photo'}
      </button>
    </>
  )
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
  const [imageUrl, setImageUrl] = useState('')
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)

  const handleUpload = async (url: string) => {
    setImageUrl(url)
    setUploading(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    setSaving(true)
    try {
      const url = type === 'location' ? '/api/locations' : '/api/bags'
      const body =
        type === 'location'
          ? { name, description, type: 'room', image_url: imageUrl || null }
          : { name, description, image_url: imageUrl || null }
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
      <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl">
        <h2 className="text-lg font-semibold mb-4">
          Add {type === 'location' ? 'Location' : 'Bag'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Photo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Photo</label>
            {imageUrl ? (
              <div className="relative w-full h-32 rounded-xl overflow-hidden border border-gray-200">
                <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => setImageUrl('')}
                  className="absolute top-1.5 right-1.5 rounded-full bg-white/80 p-1 hover:bg-white shadow-sm"
                >
                  <X className="h-3.5 w-3.5 text-gray-600" />
                </button>
              </div>
            ) : (
              <PhotoUploadButton
                uploading={uploading}
                onUpload={(url) => {
                  setUploading(false)
                  handleUpload(url)
                }}
              />
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
              placeholder={type === 'location' ? 'e.g. Walk-in Closet' : 'e.g. Travel Bag'}
              autoFocus
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
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
              className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-pink-500 py-2 text-sm font-medium text-white hover:bg-pink-600 disabled:opacity-50"
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

function PhotoDialog({
  id,
  type,
  currentUrl,
  onClose,
  onSuccess,
}: {
  id: string
  type: 'location' | 'bag'
  currentUrl?: string
  onClose: () => void
  onSuccess: () => void
}) {
  const [imageUrl, setImageUrl] = useState(currentUrl || '')
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    try {
      const url = type === 'location' ? `/api/locations/${id}` : `/api/bags/${id}`
      const res = await fetch(url, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image_url: imageUrl || null }),
      })
      if (!res.ok) throw new Error('Failed to save')
      toast.success('Photo updated!')
      onSuccess()
    } catch {
      toast.error('Failed to update photo')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl">
        <h2 className="text-lg font-semibold mb-4">Update Photo</h2>
        <div className="space-y-4">
          {imageUrl ? (
            <div className="relative w-full h-40 rounded-xl overflow-hidden border border-gray-200">
              <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => setImageUrl('')}
                className="absolute top-1.5 right-1.5 rounded-full bg-white/80 p-1 hover:bg-white shadow-sm"
              >
                <X className="h-3.5 w-3.5 text-gray-600" />
              </button>
            </div>
          ) : (
            <div className="w-full h-40 rounded-xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-2 text-gray-400">
              <Camera className="h-8 w-8" />
              <p className="text-sm">No photo</p>
            </div>
          )}
          <PhotoUploadButton
            uploading={uploading}
            onUpload={(url) => {
              setUploading(false)
              setImageUrl(url)
            }}
          />
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-lg border border-gray-200 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-pink-500 py-2 text-sm font-medium text-white hover:bg-pink-600 disabled:opacity-50"
            >
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export function LocationsClient({ locations, bags, items }: LocationsClientProps) {
  const router = useRouter()
  const [dialog, setDialog] = useState<'location' | 'bag' | null>(null)
  const [photoDialog, setPhotoDialog] = useState<{
    id: string
    type: 'location' | 'bag'
    currentUrl?: string
  } | null>(null)

  const rooms = locations.filter((l) => l.type === 'room')

  const getLocationItems = (locationId: string) =>
    items.filter((i) => i.location_id === locationId && !i.bag_id)

  const getBagItems = (bagId: string) => items.filter((i) => i.bag_id === bagId)

  const handleSuccess = () => {
    setDialog(null)
    router.refresh()
  }

  const handlePhotoSuccess = () => {
    setPhotoDialog(null)
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
      {photoDialog && (
        <PhotoDialog
          id={photoDialog.id}
          type={photoDialog.type}
          currentUrl={photoDialog.currentUrl}
          onClose={() => setPhotoDialog(null)}
          onSuccess={handlePhotoSuccess}
        />
      )}

      {/* Rooms Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <MapPin className="h-5 w-5 text-pink-400" />
            Rooms &amp; Storage
          </h2>
          <button
            onClick={() => setDialog('location')}
            className="flex items-center gap-1.5 rounded-xl border border-pink-200 bg-white px-3 py-1.5 text-sm font-medium text-pink-600 hover:bg-pink-50 transition-colors"
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
                  className="rounded-2xl border border-pink-100 bg-white shadow-sm overflow-hidden"
                >
                  {/* Photo banner */}
                  <div className="relative h-32 bg-gradient-to-br from-pink-50 to-pink-100">
                    {loc.image_url ? (
                      <img
                        src={loc.image_url}
                        alt={loc.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <MapPin className="h-10 w-10 text-pink-200" />
                      </div>
                    )}
                    <button
                      onClick={() =>
                        setPhotoDialog({ id: loc.id, type: 'location', currentUrl: loc.image_url })
                      }
                      className="absolute bottom-2 right-2 rounded-lg bg-white/80 backdrop-blur-sm p-1.5 hover:bg-white shadow-sm transition-colors"
                      title="Update photo"
                    >
                      <Camera className="h-3.5 w-3.5 text-gray-600" />
                    </button>
                  </div>

                  <div className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-semibold text-gray-900">{loc.name}</h3>
                        {loc.description && (
                          <p className="text-xs text-gray-500 mt-0.5">{loc.description}</p>
                        )}
                      </div>
                      <span className="text-xs text-pink-500 bg-pink-50 rounded-full px-2 py-0.5 font-medium">
                        {locItems.length} items
                      </span>
                    </div>

                    {locItems.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {locItems.slice(0, 6).map((item) => (
                          <Link key={item.id} href={`/items/${item.id}`}>
                            <div className="h-10 w-10 rounded-xl bg-pink-50 overflow-hidden border border-pink-100 hover:border-pink-300 transition-colors">
                              {item.image_url ? (
                                <img
                                  src={item.image_url}
                                  alt={item.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <Shirt className="h-4 w-4 text-pink-300" />
                                </div>
                              )}
                            </div>
                          </Link>
                        ))}
                        {locItems.length > 6 && (
                          <Link
                            href={`/items?location=${loc.id}`}
                            className="h-10 w-10 rounded-xl bg-pink-50 border border-pink-100 flex items-center justify-center text-xs text-pink-500 hover:bg-pink-100 font-medium"
                          >
                            +{locItems.length - 6}
                          </Link>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Bags Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Package className="h-5 w-5 text-pink-400" />
            Bags
          </h2>
          <button
            onClick={() => setDialog('bag')}
            className="flex items-center gap-1.5 rounded-xl border border-pink-200 bg-white px-3 py-1.5 text-sm font-medium text-pink-600 hover:bg-pink-50 transition-colors"
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
                  className="rounded-2xl border border-pink-100 bg-white shadow-sm overflow-hidden"
                >
                  {/* Photo banner */}
                  <div className="relative h-32 bg-gradient-to-br from-rose-50 to-pink-100">
                    {bag.image_url ? (
                      <img
                        src={bag.image_url}
                        alt={bag.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="h-10 w-10 text-pink-200" />
                      </div>
                    )}
                    <button
                      onClick={() =>
                        setPhotoDialog({ id: bag.id, type: 'bag', currentUrl: bag.image_url })
                      }
                      className="absolute bottom-2 right-2 rounded-lg bg-white/80 backdrop-blur-sm p-1.5 hover:bg-white shadow-sm transition-colors"
                      title="Update photo"
                    >
                      <Camera className="h-3.5 w-3.5 text-gray-600" />
                    </button>
                  </div>

                  <div className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-semibold text-gray-900">{bag.name}</h3>
                        {bag.description && (
                          <p className="text-xs text-gray-500 mt-0.5">{bag.description}</p>
                        )}
                      </div>
                      <span className="text-xs text-pink-500 bg-pink-50 rounded-full px-2 py-0.5 font-medium">
                        {bagItems.length} items
                      </span>
                    </div>

                    {bagItems.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {bagItems.slice(0, 6).map((item) => (
                          <Link key={item.id} href={`/items/${item.id}`}>
                            <div className="h-10 w-10 rounded-xl bg-pink-50 overflow-hidden border border-pink-100 hover:border-pink-300 transition-colors">
                              {item.image_url ? (
                                <img
                                  src={item.image_url}
                                  alt={item.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <Shirt className="h-4 w-4 text-pink-300" />
                                </div>
                              )}
                            </div>
                          </Link>
                        ))}
                        {bagItems.length > 6 && (
                          <div className="h-10 w-10 rounded-xl bg-pink-50 border border-pink-100 flex items-center justify-center text-xs text-pink-500 font-medium">
                            +{bagItems.length - 6}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
