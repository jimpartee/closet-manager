'use client'

import { useState, useEffect, useCallback } from 'react'
import { Plus, X, Shirt, Pencil, Trash2, Check, ChevronDown, ChevronUp, Search } from 'lucide-react'
import { toast } from 'sonner'
import type { SavedOutfit, Item } from '@/lib/types'

export function SavedOutfitsClient() {
  const [outfits, setOutfits] = useState<SavedOutfit[]>([])
  const [allItems, setAllItems] = useState<Item[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [editDesc, setEditDesc] = useState('')
  const [creating, setCreating] = useState(false)
  const [newName, setNewName] = useState('')
  const [newDesc, setNewDesc] = useState('')
  const [pickerOutfitId, setPickerOutfitId] = useState<string | null>(null)
  const [pickerSearch, setPickerSearch] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [outfitsRes, itemsRes] = await Promise.all([
        fetch('/api/saved-outfits'),
        fetch('/api/items'),
      ])
      const [outfitsData, itemsData] = await Promise.all([outfitsRes.json(), itemsRes.json()])
      setOutfits(Array.isArray(outfitsData) ? outfitsData : [])
      setAllItems(Array.isArray(itemsData) ? itemsData.filter((i: Item) => i.status === 'active') : [])
    } catch {
      toast.error('Failed to load outfits')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const handleCreate = async () => {
    if (!newName.trim()) return
    try {
      const res = await fetch('/api/saved-outfits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName.trim(), description: newDesc.trim() || undefined }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setOutfits((prev) => [data, ...prev])
      setNewName('')
      setNewDesc('')
      setCreating(false)
      setExpandedId(data.id)
      setPickerOutfitId(data.id)
      toast.success('Outfit created')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to create')
    }
  }

  const handleSaveEdit = async (id: string) => {
    try {
      const res = await fetch(`/api/saved-outfits/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: editName.trim(), description: editDesc.trim() || undefined }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setOutfits((prev) => prev.map((o) => o.id === id ? data : o))
      setEditingId(null)
      toast.success('Saved')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save')
    }
  }

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete "${name}"?`)) return
    try {
      const res = await fetch(`/api/saved-outfits/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete')
      setOutfits((prev) => prev.filter((o) => o.id !== id))
      toast.success('Deleted')
    } catch {
      toast.error('Failed to delete')
    }
  }

  const handleAddItem = async (outfitId: string, itemId: string) => {
    try {
      const res = await fetch(`/api/saved-outfits/${outfitId}/items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ item_id: itemId }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setOutfits((prev) =>
        prev.map((o) =>
          o.id === outfitId
            ? { ...o, outfit_items: [...(o.outfit_items ?? []), data] }
            : o
        )
      )
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to add item')
    }
  }

  const handleRemoveItem = async (outfitId: string, itemId: string) => {
    try {
      const res = await fetch(`/api/saved-outfits/${outfitId}/items/${itemId}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to remove')
      setOutfits((prev) =>
        prev.map((o) =>
          o.id === outfitId
            ? { ...o, outfit_items: (o.outfit_items ?? []).filter((oi) => oi.item_id !== itemId) }
            : o
        )
      )
    } catch {
      toast.error('Failed to remove item')
    }
  }

  const outfitItemIds = (outfit: SavedOutfit) =>
    new Set((outfit.outfit_items ?? []).map((oi) => oi.item_id))

  const filteredItems = (outfitId: string) => {
    const assigned = outfitItemIds(outfits.find((o) => o.id === outfitId)!)
    return allItems.filter(
      (item) =>
        !assigned.has(item.id) &&
        (pickerSearch === '' ||
          item.name.toLowerCase().includes(pickerSearch.toLowerCase()) ||
          (item.brand ?? '').toLowerCase().includes(pickerSearch.toLowerCase()) ||
          (item.category ?? '').toLowerCase().includes(pickerSearch.toLowerCase()))
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-widest">My Saved Outfits</h2>
        {!creating && (
          <button
            onClick={() => setCreating(true)}
            className="flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-medium text-white bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 transition-all shadow-sm shadow-pink-200"
          >
            <Plus className="h-3.5 w-3.5" />
            New Outfit
          </button>
        )}
      </div>

      {/* Create form */}
      {creating && (
        <div className="bg-white rounded-2xl border border-pink-200 p-4 mb-4">
          <p className="text-sm font-medium text-gray-700 mb-3">New Outfit</p>
          <input
            autoFocus
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
            placeholder="Outfit name (e.g. Brunch Look)"
            className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400 mb-2"
          />
          <input
            value={newDesc}
            onChange={(e) => setNewDesc(e.target.value)}
            placeholder="Description (optional)"
            className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400 mb-3"
          />
          <div className="flex gap-2">
            <button onClick={handleCreate} disabled={!newName.trim()} className="flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-medium text-white bg-pink-500 hover:bg-pink-600 disabled:opacity-50 transition-colors">
              <Check className="h-3.5 w-3.5" /> Create
            </button>
            <button onClick={() => { setCreating(false); setNewName(''); setNewDesc('') }} className="rounded-xl px-4 py-2 text-xs font-medium text-gray-500 bg-gray-100 hover:bg-gray-200 transition-colors">
              Cancel
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="space-y-3">
          {[1, 2].map((i) => <div key={i} className="h-20 bg-pink-50 rounded-2xl animate-pulse" />)}
        </div>
      ) : outfits.length === 0 ? (
        <div className="bg-white rounded-2xl border border-pink-100 p-10 text-center">
          <Shirt className="h-10 w-10 text-pink-200 mx-auto mb-3" />
          <p className="text-sm text-gray-400">No saved outfits yet</p>
          <p className="text-xs text-gray-300 mt-1">Create one to assign to calendar events</p>
        </div>
      ) : (
        <div className="space-y-3">
          {outfits.map((outfit) => {
            const isExpanded = expandedId === outfit.id
            const isEditing = editingId === outfit.id
            const isPicker = pickerOutfitId === outfit.id
            const itemCount = (outfit.outfit_items ?? []).length

            return (
              <div key={outfit.id} className="bg-white rounded-2xl border border-pink-100 overflow-hidden hover:border-pink-200 transition-all">
                {/* Header */}
                <div className="flex items-center gap-3 p-4">
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : outfit.id)}
                    className="flex-1 min-w-0 text-left"
                  >
                    <div className="flex items-center gap-2">
                      {isEditing ? (
                        <input
                          autoFocus
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          onClick={(e) => e.stopPropagation()}
                          className="flex-1 rounded-lg border border-pink-300 px-2 py-1 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-pink-400"
                        />
                      ) : (
                        <span className="font-medium text-gray-900 text-sm truncate">{outfit.name}</span>
                      )}
                      <span className="text-xs text-pink-400 flex-shrink-0">{itemCount} item{itemCount !== 1 ? 's' : ''}</span>
                    </div>
                    {!isEditing && outfit.description && (
                      <p className="text-xs text-gray-400 mt-0.5 truncate">{outfit.description}</p>
                    )}
                    {isEditing && (
                      <input
                        value={editDesc}
                        onChange={(e) => setEditDesc(e.target.value)}
                        onClick={(e) => e.stopPropagation()}
                        placeholder="Description (optional)"
                        className="mt-1.5 w-full rounded-lg border border-gray-200 px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-pink-400"
                      />
                    )}
                  </button>

                  <div className="flex items-center gap-1 flex-shrink-0">
                    {isEditing ? (
                      <>
                        <button onClick={() => handleSaveEdit(outfit.id)} className="rounded-lg p-1.5 text-pink-500 hover:bg-pink-50">
                          <Check className="h-4 w-4" />
                        </button>
                        <button onClick={() => setEditingId(null)} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100">
                          <X className="h-4 w-4" />
                        </button>
                      </>
                    ) : (
                      <>
                        <button onClick={() => { setEditingId(outfit.id); setEditName(outfit.name); setEditDesc(outfit.description ?? '') }} className="rounded-lg p-1.5 text-gray-400 hover:text-pink-500 hover:bg-pink-50 transition-colors">
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button onClick={() => handleDelete(outfit.id, outfit.name)} className="rounded-lg p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors">
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                        <button onClick={() => setExpandedId(isExpanded ? null : outfit.id)} className="rounded-lg p-1.5 text-gray-400 hover:text-pink-500 hover:bg-pink-50 transition-colors">
                          {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* Expanded items */}
                {isExpanded && (
                  <div className="border-t border-pink-50 px-4 pb-4 pt-3">
                    {/* Item chips */}
                    {(outfit.outfit_items ?? []).length > 0 ? (
                      <div className="flex flex-wrap gap-2 mb-3">
                        {(outfit.outfit_items ?? []).map((oi) => (
                          <div key={oi.id} className="flex items-center gap-1.5 rounded-xl bg-pink-50 border border-pink-100 px-2.5 py-1.5">
                            <div className="h-7 w-7 rounded-lg bg-white overflow-hidden flex-shrink-0 flex items-center justify-center border border-pink-100">
                              {oi.item?.image_url ? (
                                <img src={oi.item.image_url} alt={oi.item?.name} className="w-full h-full object-cover" />
                              ) : (
                                <Shirt className="h-3.5 w-3.5 text-pink-300" />
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-medium text-gray-800 truncate max-w-[120px]">{oi.item?.name}</p>
                              {oi.item?.cleanliness === 'dirty' && (
                                <p className="text-[10px] text-amber-500 font-medium">Dirty</p>
                              )}
                            </div>
                            <button onClick={() => handleRemoveItem(outfit.id, oi.item_id)} className="text-pink-300 hover:text-pink-600 ml-0.5 flex-shrink-0">
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-gray-400 mb-3">No items yet — add some below</p>
                    )}

                    {/* Add items toggle */}
                    <button
                      onClick={() => { setPickerOutfitId(isPicker ? null : outfit.id); setPickerSearch('') }}
                      className="flex items-center gap-1.5 text-xs font-medium text-pink-500 hover:text-pink-700 transition-colors"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      {isPicker ? 'Close picker' : 'Add items'}
                    </button>

                    {/* Item picker */}
                    {isPicker && (
                      <div className="mt-3 rounded-xl border border-pink-100 bg-pink-50 overflow-hidden">
                        <div className="flex items-center gap-2 px-3 py-2 border-b border-pink-100 bg-white">
                          <Search className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
                          <input
                            autoFocus
                            value={pickerSearch}
                            onChange={(e) => setPickerSearch(e.target.value)}
                            placeholder="Search items…"
                            className="flex-1 text-sm bg-transparent focus:outline-none text-gray-700 placeholder-gray-400"
                          />
                        </div>
                        <div className="max-h-52 overflow-y-auto">
                          {filteredItems(outfit.id).length === 0 ? (
                            <p className="text-xs text-gray-400 text-center py-4">No more items to add</p>
                          ) : (
                            filteredItems(outfit.id).map((item) => (
                              <button
                                key={item.id}
                                onClick={() => handleAddItem(outfit.id, item.id)}
                                className="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-white transition-colors text-left border-b border-pink-50 last:border-0"
                              >
                                <div className="h-8 w-8 rounded-lg bg-white overflow-hidden flex-shrink-0 flex items-center justify-center border border-pink-100">
                                  {item.image_url ? (
                                    <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                                  ) : (
                                    <Shirt className="h-3.5 w-3.5 text-pink-300" />
                                  )}
                                </div>
                                <div className="min-w-0 flex-1">
                                  <p className="text-xs font-medium text-gray-800 truncate">{item.name}</p>
                                  <p className="text-[10px] text-gray-400">{[item.brand, item.category].filter(Boolean).join(' · ')}</p>
                                </div>
                                <Plus className="h-3.5 w-3.5 text-pink-400 flex-shrink-0" />
                              </button>
                            ))
                          )}
                        </div>
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
  )
}
