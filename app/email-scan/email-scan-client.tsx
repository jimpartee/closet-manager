'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Mail, Check, Loader2, AlertTriangle, CheckSquare, FileText, Upload } from 'lucide-react'
import { CATEGORIES } from '@/lib/types'
import { toast } from 'sonner'

interface ScannedItem {
  name?: string
  brand?: string
  color?: string
  size?: string
  purchase_price?: number | string
  purchase_date?: string
  product_url?: string
  category?: string
  gmail_message_id?: string
  [key: string]: string | number | undefined
}

interface EmailScanClientProps {
  initialItems: ScannedItem[]
  error?: string
}

export function EmailScanClient({ initialItems, error }: EmailScanClientProps) {
  const router = useRouter()
  const [items, setItems] = useState<ScannedItem[]>(initialItems)
  const [selected, setSelected] = useState<Set<number>>(
    new Set(initialItems.map((_, i) => i))
  )
  const [importing, setImporting] = useState(false)
  const [scanning, setScanning] = useState(false)
  const [parsingPdf, setParsingPdf] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setParsingPdf(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      const res = await fetch('/api/parse-receipt', { method: 'POST', body: formData })
      const data = await res.json()

      if (!res.ok) {
        toast.error(data.error || 'Failed to parse PDF')
        return
      }

      if (!data.items || data.items.length === 0) {
        toast.error('No clothing items found in this PDF')
        return
      }

      const newItems = [...items, ...data.items]
      setItems(newItems)
      setSelected(new Set(newItems.map((_, i) => i)))
      toast.success(`Found ${data.items.length} item${data.items.length !== 1 ? 's' : ''} in PDF`)
    } catch {
      toast.error('Failed to upload PDF')
    } finally {
      setParsingPdf(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const updateItem = (index: number, field: string, value: string) => {
    setItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item))
    )
  }

  const toggleSelect = (index: number) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(index)) next.delete(index)
      else next.add(index)
      return next
    })
  }

  const selectAll = () => setSelected(new Set(items.map((_, i) => i)))
  const selectNone = () => setSelected(new Set())

  const handleImport = async () => {
    const toImport = items.filter((_, i) => selected.has(i))
    if (toImport.length === 0) {
      toast.error('No items selected')
      return
    }

    setImporting(true)
    let successCount = 0
    let errorCount = 0

    for (const item of toImport) {
      try {
        const res = await fetch('/api/items', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: item.name || 'Unknown Item',
            brand: item.brand || null,
            color: item.color || null,
            size: item.size || null,
            purchase_price: item.purchase_price
              ? parseFloat(String(item.purchase_price))
              : null,
            purchase_date: item.purchase_date || null,
            product_url: item.product_url || null,
            category: item.category || null,
            gmail_message_id: item.gmail_message_id || null,
            source: 'email_scan',
          }),
        })
        if (res.ok) successCount++
        else errorCount++
      } catch {
        errorCount++
      }
    }

    setImporting(false)
    if (successCount > 0) {
      toast.success(`Imported ${successCount} item${successCount !== 1 ? 's' : ''}!`)
      router.push('/items')
      router.refresh()
    }
    if (errorCount > 0) {
      toast.error(`Failed to import ${errorCount} item${errorCount !== 1 ? 's' : ''}`)
    }
  }

  const startScan = () => {
    setScanning(true)
    window.location.href = '/api/email-scan'
  }

  return (
    <div>
      {error && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-red-800">Scan Error</p>
            <p className="text-sm text-red-700 mt-1">{decodeURIComponent(error)}</p>
          </div>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,application/pdf"
        className="hidden"
        onChange={handlePdfUpload}
      />

      {items.length === 0 ? (
        <div className="rounded-xl border border-gray-200 bg-white p-12 text-center">
          <Mail className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h2 className="text-lg font-medium text-gray-900 mb-2">Import Order Items</h2>
          <p className="text-sm text-gray-500 mb-6 max-w-md mx-auto">
            Scan Gmail for order confirmation emails, or upload a PDF receipt directly.
          </p>
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <button
              onClick={startScan}
              disabled={scanning}
              className="inline-flex items-center gap-2 rounded-lg bg-pink-500 px-6 py-3 text-sm font-medium text-white hover:bg-pink-600 transition-colors disabled:opacity-50"
            >
              {scanning ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4" />}
              {scanning ? 'Connecting...' : 'Scan Gmail'}
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={parsingPdf}
              className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-6 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              {parsingPdf ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
              {parsingPdf ? 'Parsing...' : 'Upload PDF Receipt'}
            </button>
          </div>
          <p className="text-xs text-gray-400 mt-4">
            Gmail access is read-only. PDFs are processed locally and never stored.
          </p>
        </div>
      ) : (
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <p className="text-sm text-gray-600">
                Found <strong>{items.length}</strong> items · {selected.size} selected
              </p>
              <div className="flex gap-2">
                <button
                  onClick={selectAll}
                  className="text-xs text-pink-600 hover:text-pink-700"
                >
                  Select all
                </button>
                <span className="text-gray-300">|</span>
                <button
                  onClick={selectNone}
                  className="text-xs text-gray-500 hover:text-gray-700"
                >
                  None
                </button>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={parsingPdf}
                className="flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                {parsingPdf ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileText className="h-4 w-4" />}
                Upload PDF
              </button>
              <button
                onClick={startScan}
                className="flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                <Mail className="h-4 w-4" />
                Rescan Gmail
              </button>
              <button
                onClick={handleImport}
                disabled={importing || selected.size === 0}
                className="flex items-center gap-2 rounded-lg bg-pink-500 px-4 py-2 text-sm font-medium text-white hover:bg-pink-600 disabled:opacity-50"
              >
                {importing ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <CheckSquare className="h-4 w-4" />
                )}
                Import Selected ({selected.size})
              </button>
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="w-10 px-4 py-3"></th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Name
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Brand
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Color
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Size
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Price
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Category
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {items.map((item, i) => (
                  <tr
                    key={i}
                    className={selected.has(i) ? 'bg-pink-50' : 'hover:bg-gray-50'}
                  >
                    <td className="px-4 py-3">
                      <button
                        onClick={() => toggleSelect(i)}
                        className={`h-5 w-5 rounded border-2 flex items-center justify-center ${
                          selected.has(i)
                            ? 'border-pink-600 bg-pink-500'
                            : 'border-gray-300'
                        }`}
                      >
                        {selected.has(i) && <Check className="h-3 w-3 text-white" />}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <input
                        value={String(item.name || '')}
                        onChange={(e) => updateItem(i, 'name', e.target.value)}
                        className="w-full bg-transparent focus:outline-none focus:ring-1 focus:ring-pink-500 rounded px-1"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <input
                        value={String(item.brand || '')}
                        onChange={(e) => updateItem(i, 'brand', e.target.value)}
                        className="w-full bg-transparent focus:outline-none focus:ring-1 focus:ring-pink-500 rounded px-1"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <input
                        value={String(item.color || '')}
                        onChange={(e) => updateItem(i, 'color', e.target.value)}
                        className="w-full bg-transparent focus:outline-none focus:ring-1 focus:ring-pink-500 rounded px-1"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <input
                        value={String(item.size || '')}
                        onChange={(e) => updateItem(i, 'size', e.target.value)}
                        className="w-full bg-transparent focus:outline-none focus:ring-1 focus:ring-pink-500 rounded px-1"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="number"
                        value={String(item.purchase_price || '')}
                        onChange={(e) => updateItem(i, 'purchase_price', e.target.value)}
                        className="w-20 bg-transparent focus:outline-none focus:ring-1 focus:ring-pink-500 rounded px-1"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={String(item.category || '')}
                        onChange={(e) => updateItem(i, 'category', e.target.value)}
                        className="bg-transparent focus:outline-none focus:ring-1 focus:ring-pink-500 rounded text-sm"
                      >
                        <option value="">—</option>
                        {CATEGORIES.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
