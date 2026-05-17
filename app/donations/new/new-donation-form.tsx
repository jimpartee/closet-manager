'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Shirt, Loader2, ChevronRight, ChevronLeft, Check } from 'lucide-react'
import { Item } from '@/lib/types'
import { toast } from 'sonner'

interface NewDonationFormProps {
  items: Item[]
}

interface SelectedItem {
  item_id: string
  estimated_value: number
}

export function NewDonationForm({ items }: NewDonationFormProps) {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [saving, setSaving] = useState(false)

  // Step 1 fields
  const [organization, setOrganization] = useState('')
  const [donationDate, setDonationDate] = useState(new Date().toISOString().split('T')[0])
  const [notes, setNotes] = useState('')

  // Step 2 fields
  const [selectedItems, setSelectedItems] = useState<SelectedItem[]>([])

  const toggleItem = (item: Item) => {
    setSelectedItems((prev) => {
      const exists = prev.find((s) => s.item_id === item.id)
      if (exists) {
        return prev.filter((s) => s.item_id !== item.id)
      }
      return [...prev, { item_id: item.id, estimated_value: item.purchase_price || 0 }]
    })
  }

  const updateValue = (itemId: string, value: number) => {
    setSelectedItems((prev) =>
      prev.map((s) => (s.item_id === itemId ? { ...s, estimated_value: value } : s))
    )
  }

  const handleSubmit = async () => {
    if (!organization.trim()) {
      toast.error('Organization name is required')
      return
    }
    if (selectedItems.length === 0) {
      toast.error('Please select at least one item')
      return
    }

    setSaving(true)
    try {
      const res = await fetch('/api/donations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          organization,
          donation_date: donationDate,
          notes,
          items: selectedItems,
        }),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Failed to save')
      }
      const donation = await res.json()
      toast.success('Donation recorded!')
      router.push(`/donations/${donation.id}`)
      router.refresh()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save donation')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      {/* Step indicator */}
      <div className="flex items-center gap-3 mb-8">
        <div
          className={`flex items-center gap-2 text-sm font-medium ${
            step >= 1 ? 'text-pink-600' : 'text-gray-400'
          }`}
        >
          <div
            className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-semibold ${
              step > 1 ? 'bg-pink-500 text-white' : step === 1 ? 'border-2 border-pink-600 text-pink-600' : 'border-2 border-gray-200 text-gray-400'
            }`}
          >
            {step > 1 ? <Check className="h-3 w-3" /> : '1'}
          </div>
          Details
        </div>
        <div className="flex-1 h-px bg-gray-200" />
        <div
          className={`flex items-center gap-2 text-sm font-medium ${
            step >= 2 ? 'text-pink-600' : 'text-gray-400'
          }`}
        >
          <div
            className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-semibold ${
              step === 2 ? 'border-2 border-pink-600 text-pink-600' : 'border-2 border-gray-200 text-gray-400'
            }`}
          >
            2
          </div>
          Select Items
        </div>
      </div>

      {step === 1 && (
        <div className="rounded-xl border border-gray-200 bg-white p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Organization <span className="text-red-500">*</span>
            </label>
            <input
              value={organization}
              onChange={(e) => setOrganization(e.target.value)}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
              placeholder="e.g. Goodwill, Salvation Army"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Donation Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={donationDate}
              onChange={(e) => setDonationDate(e.target.value)}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
              placeholder="Optional notes about this donation..."
            />
          </div>

          <button
            onClick={() => {
              if (!organization.trim()) {
                toast.error('Organization name is required')
                return
              }
              setStep(2)
            }}
            className="flex items-center gap-2 rounded-lg bg-pink-500 px-4 py-2 text-sm font-medium text-white hover:bg-pink-600 transition-colors"
          >
            Next: Select Items
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}

      {step === 2 && (
        <div>
          <div className="mb-4 flex items-center justify-between">
            <button
              onClick={() => setStep(1)}
              className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
            >
              <ChevronLeft className="h-4 w-4" />
              Back
            </button>
            <p className="text-sm text-gray-500">
              {selectedItems.length} item{selectedItems.length !== 1 ? 's' : ''} selected
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-3 mb-6">
            {items.map((item) => {
              const selected = selectedItems.find((s) => s.item_id === item.id)
              return (
                <div
                  key={item.id}
                  className={`rounded-xl border p-4 cursor-pointer transition-colors ${
                    selected
                      ? 'border-pink-300 bg-pink-50'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                  onClick={() => toggleItem(item)}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`h-5 w-5 rounded border-2 flex items-center justify-center flex-shrink-0 ${
                        selected ? 'border-pink-600 bg-pink-500' : 'border-gray-300'
                      }`}
                    >
                      {selected && <Check className="h-3 w-3 text-white" />}
                    </div>
                    <div className="h-12 w-12 rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden flex-shrink-0">
                      {item.image_url ? (
                        <img
                          src={item.image_url}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Shirt className="h-5 w-5 text-gray-400" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{item.name}</p>
                      <p className="text-xs text-gray-500">
                        {item.brand && `${item.brand} · `}
                        {item.color}
                      </p>
                    </div>
                  </div>

                  {selected && (
                    <div
                      className="mt-3 pt-3 border-t border-pink-200"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Estimated Value ($)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={selected.estimated_value}
                        onChange={(e) => updateValue(item.id, parseFloat(e.target.value) || 0)}
                        className="w-full rounded border border-pink-200 px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-pink-500"
                      />
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {items.length === 0 && (
            <div className="text-center py-12 text-gray-400">
              <Shirt className="h-10 w-10 mx-auto mb-3 text-gray-300" />
              <p>No active items to donate.</p>
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={saving || selectedItems.length === 0}
            className="flex items-center gap-2 rounded-lg bg-pink-500 px-6 py-2.5 text-sm font-medium text-white hover:bg-pink-600 transition-colors disabled:opacity-50"
          >
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
            Record Donation ({selectedItems.length} items)
          </button>
        </div>
      )}
    </div>
  )
}
