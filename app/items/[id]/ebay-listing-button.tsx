'use client'

import { useState } from 'react'
import { Loader2, X, Copy, Check, ExternalLink, ChevronRight } from 'lucide-react'

const EBAY_CONDITIONS = [
  {
    group: 'New',
    options: [
      {
        value: 'New with tags',
        cue: 'Brand new, unused — original tags and packaging intact',
        detail: 'The item has never been worn and still has all original tags attached and/or is in original packaging.',
      },
      {
        value: 'New without tags',
        cue: 'Brand new, unused — but tags or packaging are missing',
        detail: 'The item has never been worn but original tags have been removed or packaging is missing.',
      },
      {
        value: 'New with defects',
        cue: 'Brand new but with minor cosmetic flaws from manufacturing',
        detail: 'Never worn, but may have small imperfections like loose threads, missing buttons, or minor marks from the manufacturing or delivery process.',
      },
    ],
  },
  {
    group: 'Pre-owned',
    options: [
      {
        value: 'Pre-owned - Excellent',
        cue: 'Previously worn, but looks practically new — no visible wear',
        detail: 'Has been worn before, but shows no signs of wear. Should look and feel nearly new.',
      },
      {
        value: 'Pre-owned - Good',
        cue: 'Gently used with only minor signs of wear',
        detail: 'Has been worn a few times. May have light scratches, slight fading, or minor tarnishing. All imperfections should be described.',
      },
      {
        value: 'Pre-owned - Fair',
        cue: 'Noticeably used — significant visible wear or imperfections',
        detail: 'Has been well-worn. May have scratches, dents, broken or missing parts, or significant fading. All flaws must be disclosed.',
      },
    ],
  },
  {
    group: 'Refurbished',
    options: [
      {
        value: 'Certified - Refurbished',
        cue: 'Professionally restored to like-new by the manufacturer',
        detail: 'Restored by the manufacturer or an approved vendor. Comes in new packaging with original or new accessories.',
      },
      {
        value: 'Excellent - Refurbished',
        cue: 'Like-new condition, professionally refurbished — 1-year warranty',
        detail: 'Professionally inspected, cleaned, and refurbished to excellent condition. Includes 1-year warranty and new generic packaging.',
      },
      {
        value: 'Very Good - Refurbished',
        cue: 'Minimal wear, professionally refurbished — 1-year warranty',
        detail: 'Shows minimal wear. Fully functional and professionally refurbished to very good condition. Includes 1-year warranty.',
      },
      {
        value: 'Good - Refurbished',
        cue: 'Moderate wear, professionally refurbished — 1-year warranty',
        detail: 'Shows moderate wear. Fully functional and professionally refurbished to good condition. Includes 1-year warranty.',
      },
    ],
  },
]

interface GeneratedListing {
  title: string
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
        <><Check className="h-3 w-3 text-green-500" /><span className="text-green-500">Copied</span></>
      ) : (
        <><Copy className="h-3 w-3" />Copy</>
      )}
    </button>
  )
}

export function EbayListingButton({ itemId }: EbayListingButtonProps) {
  const [open, setOpen] = useState(false)
  const [condition, setCondition] = useState('')
  const [expandedCondition, setExpandedCondition] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [listing, setListing] = useState<GeneratedListing | null>(null)
  const [error, setError] = useState<string | null>(null)

  const generate = async () => {
    if (!condition) return
    setLoading(true)
    setListing(null)
    setError(null)
    try {
      const res = await fetch(`/api/items/${itemId}/ebay-listing`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ condition }),
      })
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
    setCondition('')
    setListing(null)
    setError(null)
    setExpandedCondition(null)
  }

  const reset = () => {
    setListing(null)
    setError(null)
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
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
                <h2 className="text-base font-semibold text-gray-900">
                  {listing ? 'eBay Listing Draft' : 'Select Item Condition'}
                </h2>
                <p className="text-xs text-gray-400 mt-0.5">
                  {listing
                    ? 'Copy each section into eBay\'s sell form'
                    : 'eBay requires an official condition — pick the one that best matches'}
                </p>
              </div>
              <button type="button" onClick={close} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 transition-colors">
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Body */}
            <div className="overflow-y-auto px-6 py-5 flex-1">

              {/* — Step 1: Condition picker — */}
              {!listing && !loading && (
                <div className="space-y-5">
                  {EBAY_CONDITIONS.map((group) => (
                    <div key={group.group}>
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                        {group.group}
                      </p>
                      <div className="space-y-2">
                        {group.options.map((opt) => {
                          const selected = condition === opt.value
                          const expanded = expandedCondition === opt.value
                          return (
                            <div
                              key={opt.value}
                              onClick={() => setCondition(opt.value)}
                              className={`rounded-lg border p-3 cursor-pointer transition-colors ${
                                selected
                                  ? 'border-violet-400 bg-violet-50'
                                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                              }`}
                            >
                              <div className="flex items-start gap-3">
                                {/* Radio dot */}
                                <div className={`mt-0.5 h-4 w-4 shrink-0 rounded-full border-2 flex items-center justify-center transition-colors ${
                                  selected ? 'border-violet-500' : 'border-gray-300'
                                }`}>
                                  {selected && <div className="h-2 w-2 rounded-full bg-violet-500" />}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className={`text-sm font-medium ${selected ? 'text-violet-900' : 'text-gray-900'}`}>
                                    {opt.value}
                                  </p>
                                  <p className="text-xs text-gray-500 mt-0.5">{opt.cue}</p>
                                  {/* Expandable full eBay definition */}
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      setExpandedCondition(expanded ? null : opt.value)
                                    }}
                                    className="flex items-center gap-1 mt-1.5 text-xs text-violet-600 hover:text-violet-700"
                                  >
                                    <ChevronRight className={`h-3 w-3 transition-transform ${expanded ? 'rotate-90' : ''}`} />
                                    {expanded ? 'Hide' : 'eBay\'s official definition'}
                                  </button>
                                  {expanded && (
                                    <p className="mt-2 text-xs text-gray-600 leading-relaxed border-l-2 border-violet-200 pl-3">
                                      {opt.detail}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  ))}

                  {error && (
                    <div className="rounded-lg bg-red-50 border border-red-100 p-4 text-sm text-red-600">
                      {error}
                    </div>
                  )}
                </div>
              )}

              {/* — Loading — */}
              {loading && (
                <div className="flex flex-col items-center justify-center py-20 gap-3">
                  <Loader2 className="h-8 w-8 text-violet-500 animate-spin" />
                  <p className="text-sm text-gray-500">Generating your listing with AI…</p>
                </div>
              )}

              {/* — Step 2: Generated listing — */}
              {listing && (
                <div className="space-y-5">
                  {/* Selected condition pill */}
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">Condition:</span>
                    <span className="rounded-full bg-violet-50 border border-violet-200 px-3 py-0.5 text-xs font-medium text-violet-700">
                      {condition}
                    </span>
                    <button type="button" onClick={reset} className="text-xs text-gray-400 hover:text-gray-600 underline underline-offset-2">
                      change
                    </button>
                  </div>

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

                  {/* Price */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Suggested Price</label>
                      <CopyButton text={listing.suggested_price.toString()} />
                    </div>
                    <p className="rounded-lg bg-gray-50 border border-gray-100 px-4 py-3 text-sm text-gray-900 font-medium">
                      ${listing.suggested_price.toFixed(2)}
                    </p>
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
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-gray-100 shrink-0 flex justify-between items-center">
              {!listing && !loading && (
                <>
                  <p className="text-xs text-gray-400">
                    {condition ? `Selected: ${condition}` : 'No condition selected yet'}
                  </p>
                  <button
                    type="button"
                    onClick={generate}
                    disabled={!condition}
                    className="flex items-center gap-2 rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Generate Listing
                  </button>
                </>
              )}

              {listing && (
                <>
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
                </>
              )}
            </div>

          </div>
        </div>
      )}
    </>
  )
}
