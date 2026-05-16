'use client'

import { useState } from 'react'
import { Bell, BellOff, Loader2, Plus } from 'lucide-react'
import { PriceAlert } from '@/lib/types'
import { toast } from 'sonner'

interface PriceAlertSectionProps {
  itemId: string
  productUrl?: string
  alerts: PriceAlert[]
}

export function PriceAlertSection({ itemId, productUrl, alerts: initialAlerts }: PriceAlertSectionProps) {
  const [alerts, setAlerts] = useState<PriceAlert[]>(initialAlerts)
  const [showForm, setShowForm] = useState(false)
  const [targetPrice, setTargetPrice] = useState('')
  const [alertUrl, setAlertUrl] = useState(productUrl || '')
  const [saving, setSaving] = useState(false)

  const addAlert = async () => {
    if (!alertUrl || !targetPrice) {
      toast.error('Please provide a URL and target price')
      return
    }
    setSaving(true)
    try {
      const res = await fetch('/api/price-alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          item_id: itemId,
          product_url: alertUrl,
          target_price: parseFloat(targetPrice),
        }),
      })
      if (!res.ok) throw new Error('Failed to create alert')
      const newAlert = await res.json()
      setAlerts((prev) => [newAlert, ...prev])
      setShowForm(false)
      setTargetPrice('')
      toast.success('Price alert set!')
    } catch {
      toast.error('Failed to create price alert')
    } finally {
      setSaving(false)
    }
  }

  const deleteAlert = async (alertId: string) => {
    try {
      const res = await fetch(`/api/price-alerts?id=${alertId}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete')
      setAlerts((prev) => prev.filter((a) => a.id !== alertId))
      toast.success('Alert removed')
    } catch {
      toast.error('Failed to remove alert')
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-gray-900 flex items-center gap-2">
          <Bell className="h-4 w-4 text-gray-400" />
          Price Alerts
        </h3>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-1 text-xs text-violet-600 hover:text-violet-700"
          >
            <Plus className="h-3 w-3" />
            Add Alert
          </button>
        )}
      </div>

      {showForm && (
        <div className="rounded-lg border border-violet-100 bg-violet-50 p-3 mb-3 space-y-2">
          <div>
            <label className="text-xs font-medium text-gray-600">Product URL</label>
            <input
              value={alertUrl}
              onChange={(e) => setAlertUrl(e.target.value)}
              className="mt-1 w-full rounded border border-gray-200 px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-violet-500"
              placeholder="https://..."
            />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600">Target Price ($)</label>
            <input
              type="number"
              step="0.01"
              value={targetPrice}
              onChange={(e) => setTargetPrice(e.target.value)}
              className="mt-1 w-full rounded border border-gray-200 px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-violet-500"
              placeholder="0.00"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowForm(false)}
              className="flex-1 rounded border border-gray-200 py-1.5 text-xs text-gray-600 hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              onClick={addAlert}
              disabled={saving}
              className="flex-1 flex items-center justify-center gap-1 rounded bg-violet-600 py-1.5 text-xs text-white hover:bg-violet-700 disabled:opacity-50"
            >
              {saving && <Loader2 className="h-3 w-3 animate-spin" />}
              Set Alert
            </button>
          </div>
        </div>
      )}

      {alerts.length === 0 ? (
        <p className="text-xs text-gray-400">No price alerts set.</p>
      ) : (
        <ul className="space-y-2">
          {alerts.map((alert) => (
            <li
              key={alert.id}
              className="flex items-center justify-between rounded-lg border border-gray-100 bg-gray-50 px-3 py-2"
            >
              <div>
                <p className="text-sm font-medium text-gray-700">
                  Target: ${alert.target_price.toFixed(2)}
                </p>
                <a
                  href={alert.product_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-violet-600 truncate block max-w-[200px]"
                >
                  {alert.product_url}
                </a>
              </div>
              <button
                onClick={() => deleteAlert(alert.id)}
                className="text-gray-400 hover:text-red-500 transition-colors"
              >
                <BellOff className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
