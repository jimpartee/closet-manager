'use client'

import { useState, useEffect } from 'react'
import { Loader2 } from 'lucide-react'
import { CATEGORIES, GENDERS, Location, Bag } from '@/lib/types'
import { toast } from 'sonner'

const NO_CHANGE = ''
const CLEAR = '__clear__'

interface BulkEditBarProps {
  selectedIds: string[]
  onCancel: () => void
  onApplied: () => void
}

export function BulkEditBar({ selectedIds, onCancel, onApplied }: BulkEditBarProps) {
  const [gender, setGender] = useState(NO_CHANGE)
  const [category, setCategory] = useState(NO_CHANGE)
  const [status, setStatus] = useState(NO_CHANGE)
  const [locationId, setLocationId] = useState(NO_CHANGE)
  const [bagId, setBagId] = useState(NO_CHANGE)
  const [locations, setLocations] = useState<Location[]>([])
  const [bags, setBags] = useState<Bag[]>([])
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetch('/api/locations')
      .then((r) => r.json())
      .then(({ locations, bags }) => {
        setLocations(locations ?? [])
        setBags(bags ?? [])
      })
      .catch(() => {})
  }, [])

  const selectClass =
    'rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500'

  const handleApply = async () => {
    const updates: Record<string, string | null> = {}
    if (gender !== NO_CHANGE) updates.gender = gender
    if (category !== NO_CHANGE) updates.category = category
    if (status !== NO_CHANGE) updates.status = status
    if (locationId !== NO_CHANGE) updates.location_id = locationId === CLEAR ? null : locationId
    if (bagId !== NO_CHANGE) updates.bag_id = bagId === CLEAR ? null : bagId

    if (Object.keys(updates).length === 0) {
      toast.error('Select at least one field to change')
      return
    }

    setSaving(true)
    try {
      const res = await fetch('/api/items/bulk', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: selectedIds, updates }),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Failed to update')
      }
      toast.success(`Updated ${selectedIds.length} item${selectedIds.length !== 1 ? 's' : ''}`)
      onApplied()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to update items')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-gray-200 bg-white shadow-xl">
      <div className="mx-auto max-w-screen-xl px-4 py-3">
        {/* Header row */}
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-medium text-gray-900">
            {selectedIds.length} item{selectedIds.length !== 1 ? 's' : ''} selected
          </p>
          <p className="text-xs text-gray-400">Only filled fields will be updated</p>
        </div>

        {/* Fields + actions */}
        <div className="flex flex-wrap gap-2 items-end">
          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-500">Gender</label>
            <select value={gender} onChange={(e) => setGender(e.target.value)} className={selectClass}>
              <option value={NO_CHANGE}>— no change —</option>
              {GENDERS.map((g) => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-500">Category</label>
            <select value={category} onChange={(e) => setCategory(e.target.value)} className={selectClass}>
              <option value={NO_CHANGE}>— no change —</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-500">Status</label>
            <select value={status} onChange={(e) => setStatus(e.target.value)} className={selectClass}>
              <option value={NO_CHANGE}>— no change —</option>
              <option value="active">Active</option>
              <option value="donated">Donated</option>
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-500">Location</label>
            <select value={locationId} onChange={(e) => setLocationId(e.target.value)} className={selectClass}>
              <option value={NO_CHANGE}>— no change —</option>
              <option value={CLEAR}>Clear location</option>
              {locations.map((loc) => (
                <option key={loc.id} value={loc.id}>{loc.name}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-500">Bag</label>
            <select value={bagId} onChange={(e) => setBagId(e.target.value)} className={selectClass}>
              <option value={NO_CHANGE}>— no change —</option>
              <option value={CLEAR}>Clear bag</option>
              {bags.map((bag) => (
                <option key={bag.id} value={bag.id}>{bag.name}</option>
              ))}
            </select>
          </div>

          <div className="flex gap-2 ml-auto">
            <button
              type="button"
              onClick={onCancel}
              className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleApply}
              disabled={saving || selectedIds.length === 0}
              className="flex items-center gap-2 rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-700 transition-colors disabled:opacity-50"
            >
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}
              Apply to {selectedIds.length} item{selectedIds.length !== 1 ? 's' : ''}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
