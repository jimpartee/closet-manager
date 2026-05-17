'use client'

import { useState } from 'react'
import { Sparkles, Loader2, ShoppingBag, ExternalLink, Shirt } from 'lucide-react'
import { toast } from 'sonner'
import { Item } from '@/lib/types'

const QUICK_CONTEXTS = ['Casual', 'Work', 'Date Night', 'Travel', 'Formal', 'Weekend', 'Beach']

interface MissingPiece {
  description: string
  estimated_price: number
  search_query: string
}

interface Outfit {
  name: string
  occasion: string
  owned_items: string[]
  owned_items_details: Item[]
  missing_pieces: MissingPiece[]
  styling_tips: string
}

function OutfitSkeleton() {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 animate-pulse">
      <div className="h-5 bg-gray-200 rounded w-48 mb-2" />
      <div className="h-3 bg-gray-100 rounded w-24 mb-4" />
      <div className="space-y-2">
        <div className="h-3 bg-gray-100 rounded w-full" />
        <div className="h-3 bg-gray-100 rounded w-3/4" />
        <div className="h-3 bg-gray-100 rounded w-5/6" />
      </div>
    </div>
  )
}

function OutfitCard({ outfit }: { outfit: Outfit }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900">{outfit.name}</h3>
        <span className="inline-flex items-center rounded-full bg-pink-50 px-2.5 py-0.5 text-xs font-medium text-pink-700 mt-1">
          {outfit.occasion}
        </span>
      </div>

      {/* Owned Items */}
      {outfit.owned_items_details && outfit.owned_items_details.length > 0 && (
        <div className="mb-5">
          <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">
            From Your Wardrobe
          </h4>
          <div className="flex flex-wrap gap-2">
            {outfit.owned_items_details.map((item: Item) => (
              <a
                key={item.id}
                href={`/items/${item.id}`}
                className="flex items-center gap-2 rounded-lg border border-gray-100 bg-gray-50 px-3 py-2 text-sm hover:border-pink-200 hover:bg-pink-50 transition-colors"
              >
                <div className="h-7 w-7 rounded bg-gray-200 flex items-center justify-center overflow-hidden flex-shrink-0">
                  {item.image_url ? (
                    <img
                      src={item.image_url}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Shirt className="h-3.5 w-3.5 text-gray-400" />
                  )}
                </div>
                <div>
                  <p className="font-medium text-gray-800 leading-tight">{item.name}</p>
                  {item.brand && (
                    <p className="text-xs text-gray-400">{item.brand}</p>
                  )}
                </div>
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Missing Pieces */}
      {outfit.missing_pieces && outfit.missing_pieces.length > 0 && (
        <div className="mb-5">
          <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">
            Suggested Additions
          </h4>
          <div className="space-y-2">
            {outfit.missing_pieces.map((piece: MissingPiece, i: number) => (
              <div
                key={i}
                className="flex items-center justify-between rounded-lg border border-dashed border-gray-200 bg-gray-50 px-3 py-2.5"
              >
                <div className="flex items-center gap-2">
                  <ShoppingBag className="h-4 w-4 text-gray-400 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-gray-700">{piece.description}</p>
                    <p className="text-xs text-gray-400">~${piece.estimated_price}</p>
                  </div>
                </div>
                <a
                  href={`https://www.google.com/search?tbm=shop&q=${encodeURIComponent(piece.search_query)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-xs text-pink-600 hover:text-pink-700 flex-shrink-0 ml-3"
                >
                  Shop
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Styling Tips */}
      {outfit.styling_tips && (
        <div className="rounded-lg bg-amber-50 border border-amber-100 p-3">
          <p className="text-xs font-medium text-amber-700 mb-1">Styling Tips</p>
          <p className="text-sm text-amber-800">{outfit.styling_tips}</p>
        </div>
      )}
    </div>
  )
}

export function OutfitsClient() {
  const [context, setContext] = useState('')
  const [loading, setLoading] = useState(false)
  const [outfits, setOutfits] = useState<Outfit[] | null>(null)

  const generate = async (ctx: string = context) => {
    if (!ctx.trim()) {
      toast.error('Please describe the occasion')
      return
    }
    setLoading(true)
    setOutfits(null)
    try {
      const res = await fetch('/api/outfits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ context: ctx }),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Failed to generate outfits')
      }
      const { outfits: data } = await res.json()
      setOutfits(data)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to generate outfits')
    } finally {
      setLoading(false)
    }
  }

  const handleQuickContext = (ctx: string) => {
    setContext(ctx)
    generate(ctx)
  }

  return (
    <div>
      {/* Input */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          What&apos;s the occasion?
        </label>
        <div className="flex gap-3">
          <input
            value={context}
            onChange={(e) => setContext(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && generate()}
            className="flex-1 rounded-lg border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
            placeholder="e.g. First date at a nice restaurant..."
          />
          <button
            onClick={() => generate()}
            disabled={loading || !context.trim()}
            className="flex items-center gap-2 rounded-lg bg-pink-500 px-5 py-2.5 text-sm font-medium text-white hover:bg-pink-600 transition-colors disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4" />
            )}
            Generate
          </button>
        </div>

        {/* Quick Select */}
        <div className="flex flex-wrap gap-2 mt-4">
          {QUICK_CONTEXTS.map((ctx) => (
            <button
              key={ctx}
              onClick={() => handleQuickContext(ctx)}
              disabled={loading}
              className={`rounded-full px-3 py-1.5 text-sm transition-colors disabled:opacity-50 ${
                context === ctx
                  ? 'bg-violet-100 text-pink-700 border border-pink-300'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border border-transparent'
              }`}
            >
              {ctx}
            </button>
          ))}
        </div>
      </div>

      {/* Loading skeleton */}
      {loading && (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          <OutfitSkeleton />
          <OutfitSkeleton />
          <OutfitSkeleton />
        </div>
      )}

      {/* Results */}
      {outfits && !loading && (
        <div>
          <p className="text-sm text-gray-500 mb-4">
            {outfits.length} outfit{outfits.length !== 1 ? 's' : ''} for &ldquo;{context}&rdquo;
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {outfits.map((outfit, i) => (
              <OutfitCard key={i} outfit={outfit} />
            ))}
          </div>
        </div>
      )}

      {/* Empty state */}
      {!loading && !outfits && (
        <div className="text-center py-16 text-gray-400">
          <Sparkles className="h-12 w-12 mx-auto mb-3 text-gray-300" />
          <p className="text-sm">Enter an occasion above to get outfit recommendations.</p>
        </div>
      )}
    </div>
  )
}
