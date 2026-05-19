'use client'

import { useState } from 'react'
import { Truck, Clock, Star, ChevronRight } from 'lucide-react'

interface NoScrubsCTAProps {
  itemCount: number
}

export function NoScrubsCTA({ itemCount }: NoScrubsCTAProps) {
  const [ordered, setOrdered] = useState(false)

  const estimatedPrice = (itemCount * 2.5).toFixed(2)

  if (ordered) {
    return (
      <div className="rounded-2xl border border-teal-200 bg-teal-50 p-6">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-teal-500 p-2.5">
            <Truck className="h-5 w-5 text-white" />
          </div>
          <div>
            <p className="font-semibold text-teal-900">Pickup scheduled!</p>
            <p className="text-sm text-teal-700">NoScrubs will arrive between 2–4 PM today. You'll get a text when they're on the way.</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-2xl border border-teal-200 bg-gradient-to-br from-teal-50 to-cyan-50 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-teal-500 to-cyan-500 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="rounded-lg bg-white/20 p-1.5">
            <Truck className="h-4 w-4 text-white" />
          </div>
          <span className="font-bold text-white text-lg tracking-tight">NoScrubs</span>
        </div>
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((s) => (
            <Star key={s} className="h-3 w-3 fill-white text-white" />
          ))}
          <span className="text-white/80 text-xs ml-1">4.9</span>
        </div>
      </div>

      {/* Body */}
      <div className="px-6 py-5">
        <p className="text-teal-900 font-semibold text-base mb-1">
          Ready to clean {itemCount} {itemCount === 1 ? 'item' : 'items'}?
        </p>
        <p className="text-teal-700 text-sm mb-5">
          We pick up, wash, fold, and deliver — usually same day or next day.
        </p>

        <div className="grid grid-cols-3 gap-3 mb-5">
          <div className="rounded-xl bg-white/70 border border-teal-100 p-3 text-center">
            <Clock className="h-4 w-4 text-teal-500 mx-auto mb-1" />
            <p className="text-xs font-semibold text-teal-900">Same Day</p>
            <p className="text-[10px] text-teal-600">Pickup available</p>
          </div>
          <div className="rounded-xl bg-white/70 border border-teal-100 p-3 text-center">
            <Truck className="h-4 w-4 text-teal-500 mx-auto mb-1" />
            <p className="text-xs font-semibold text-teal-900">Free Pickup</p>
            <p className="text-[10px] text-teal-600">&amp; delivery</p>
          </div>
          <div className="rounded-xl bg-white/70 border border-teal-100 p-3 text-center">
            <span className="text-teal-500 text-sm font-bold block mb-1">${estimatedPrice}</span>
            <p className="text-xs font-semibold text-teal-900">Est. Total</p>
            <p className="text-[10px] text-teal-600">$2.50/item</p>
          </div>
        </div>

        <button
          onClick={() => setOrdered(true)}
          className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 px-4 py-3 text-sm font-semibold text-white hover:from-teal-600 hover:to-cyan-600 transition-all shadow-sm shadow-teal-200 active:scale-[0.98]"
        >
          Schedule Pickup
          <ChevronRight className="h-4 w-4" />
        </button>
        <p className="text-center text-[10px] text-teal-500 mt-2">
          Mock integration — no real order will be placed
        </p>
      </div>
    </div>
  )
}
