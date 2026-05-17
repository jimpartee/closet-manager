'use client'

import { useState, useMemo, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Search, Layers } from 'lucide-react'
import { Item, CATEGORIES, GENDERS } from '@/lib/types'
import { ItemCard } from '@/components/item-card'
import { BulkEditBar } from './bulk-edit-bar'

interface ItemFiltersProps {
  items: Item[]
}

export function ItemFilters({ items }: ItemFiltersProps) {
  const router = useRouter()
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')
  const [gender, setGender] = useState('')
  const [status, setStatus] = useState<'all' | 'active' | 'donated'>('all')
  const [bulkMode, setBulkMode] = useState(false)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  const filtered = useMemo(() => {
    return items.filter((item) => {
      const matchesSearch =
        !search ||
        item.name.toLowerCase().includes(search.toLowerCase()) ||
        (item.brand || '').toLowerCase().includes(search.toLowerCase())
      const matchesCategory = !category || item.category === category
      const matchesGender = !gender || item.gender === gender
      const matchesStatus = status === 'all' || item.status === status
      return matchesSearch && matchesCategory && matchesGender && matchesStatus
    })
  }, [items, search, category, gender, status])

  const toggleItem = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }, [])

  const allFilteredSelected =
    filtered.length > 0 && filtered.every((i) => selectedIds.has(i.id))

  const toggleSelectAll = () => {
    if (allFilteredSelected) {
      setSelectedIds((prev) => {
        const next = new Set(prev)
        filtered.forEach((i) => next.delete(i.id))
        return next
      })
    } else {
      setSelectedIds((prev) => {
        const next = new Set(prev)
        filtered.forEach((i) => next.add(i.id))
        return next
      })
    }
  }

  const exitBulkMode = () => {
    setBulkMode(false)
    setSelectedIds(new Set())
  }

  return (
    <div className={bulkMode ? 'pb-36' : ''}>
      {/* Filter bar */}
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search items..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-gray-200 bg-white pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
          />
        </div>

        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
        >
          <option value="">All Categories</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>

        <select
          value={gender}
          onChange={(e) => setGender(e.target.value)}
          className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
        >
          <option value="">All Genders</option>
          {GENDERS.map((g) => (
            <option key={g} value={g}>{g}</option>
          ))}
        </select>

        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as 'all' | 'active' | 'donated')}
          className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="donated">Donated</option>
        </select>

        <button
          type="button"
          onClick={() => {
            setBulkMode((v) => !v)
            setSelectedIds(new Set())
          }}
          className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
            bulkMode
              ? 'border-pink-300 bg-pink-50 text-pink-700'
              : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
          }`}
        >
          <Layers className="h-4 w-4" />
          {bulkMode ? 'Done' : 'Bulk Edit'}
        </button>
      </div>

      {/* Count row with select-all in bulk mode */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-gray-500">
          {bulkMode
            ? `${selectedIds.size} of ${filtered.length} selected`
            : `Showing ${filtered.length} of ${items.length} items`}
        </p>
        {bulkMode && filtered.length > 0 && (
          <button
            type="button"
            onClick={toggleSelectAll}
            className="text-sm text-pink-600 hover:text-pink-700 font-medium"
          >
            {allFilteredSelected ? 'Deselect all' : 'Select all'}
          </button>
        )}
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-gray-400">No items match your filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {filtered.map((item) => (
            <ItemCard
              key={item.id}
              item={item}
              selectable={bulkMode}
              selected={selectedIds.has(item.id)}
              onToggle={() => toggleItem(item.id)}
            />
          ))}
        </div>
      )}

      {bulkMode && (
        <BulkEditBar
          selectedIds={[...selectedIds]}
          onCancel={exitBulkMode}
          onApplied={() => {
            exitBulkMode()
            router.refresh()
          }}
        />
      )}
    </div>
  )
}
