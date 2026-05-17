'use client'

import { useState } from 'react'
import { Loader2, X, Copy, Check, ExternalLink } from 'lucide-react'

interface GeneratedListing {
  title: string
  condition: string
  suggested_price: number
  description: string
}

interface EbayListingButtonProps {
  itemId: string
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="flex items-center gap-1 rounded px-2 py-1 text-xs text-gray-500 hover:bg-gray-100 transition-colors"
    >
      {copied ? (
        <>
          <Check className="h-3 w-3 text-green-500" />
          <span className="text-green-500">Copied</span>
        </>
      ) : (
        <>
          <Copy className="h-3 w-3" />
          Copy
        </>
      )}
    </button>
  )
}

export function EbayListingButton({ itemId }: EbayListingButtonProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [listing, setListing] = useState<GeneratedListing | null>(null)
  const [error, setError] = useState<string | null>(null)

  const generate = async () => {
    setOpen(true)
    setLoading(true)
    setListing(null)
    setError(null)
    try {
      const res = await fetch(`/api/items/${itemId}/ebay-listing`, { method: 'POST' })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Failed to generate listing')
      }
      setListing(await res.json())
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const close = () => {
    setOpen(false)
    setListing(null)
    setError(null)
  }

  return (
    <>
      <button
        type="button"
        onClick={generate}
        className="flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
      >
        <span className="text-base leading-none">🛒</span>
        <span className="hidden sm:inline">List on eBay</span>
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="relative bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
              <div>
                <h2 className="text-base font-semibold text-gray-900">eBay Listing Draft</h2>
                <p className="text-xs text-gray-400 mt-0.5">Copy each section into eBay's sell form</p>
              </div>
              <button
                type="button"
                onClick={close}
                className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Body */}
            <div className="overflow-y-auto px-6 py-5 space-y-5">
              {loading && (
                <div className="flex flex-col items-center justify-center py-16 gap-3">
                  <Loader2 className="h-8 w-8 text-violet-500 animate-spin" />
                  <p className="text-sm text-gray-500">Generating your listing with AI…</p>
                </div>
              )}

              {error && (
                <div className="rounded-lg bg-red-50 border border-red-100 p-4 text-sm text-red-600">
                  {error}
                </div>
              )}

              {listing && (
                <>
                  {/* Title */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Title</label>
                      <CopyButton text={listing.title} />
                    </div>
                    <p className="rounded-lg bg-gray-50 border border-gray-100 px-4 py-3 text-sm text-gray-900">
                      {listing.title}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">{listing.title.length}/80 characters</p>
                  </div>

                  {/* Condition + Price */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wide block mb-1.5">
                        Condition
                      </label>
                      <p className="rounded-lg bg-gray-50 border border-gray-100 px-4 py-3 text-sm text-gray-900">
                        {listing.condition}
                      </p>
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                          Suggested Price
                        </label>
                        <CopyButton text={listing.suggested_price.toString()} />
                      </div>
                      <p className="rounded-lg bg-gray-50 border border-gray-100 px-4 py-3 text-sm text-gray-900 font-medium">
                        ${listing.suggested_price.toFixed(2)}
                      </p>
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Description</label>
                      <CopyButton text={listing.description} />
                    </div>
                    <p className="rounded-lg bg-gray-50 border border-gray-100 px-4 py-3 text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                      {listing.description}
                    </p>
                  </div>
                </>
              )}
            </div>

            {/* Footer */}
            {listing && (
              <div className="px-6 py-4 border-t border-gray-100 shrink-0 flex justify-between items-center">
                <button
                  type="button"
                  onClick={generate}
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  Regenerate
                </button>
                <a
                  href="https://www.ebay.com/sell"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 rounded-lg bg-yellow-400 hover:bg-yellow-500 px-4 py-2 text-sm font-semibold text-gray-900 transition-colors"
                >
                  Open eBay to Sell
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}
