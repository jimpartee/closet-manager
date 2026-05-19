'use client'

import { useState, useEffect } from 'react'
import { Shirt, X } from 'lucide-react'
import { toast } from 'sonner'

interface Prompt {
  item: {
    id: string
    name: string
    brand?: string
    image_url?: string
    category?: string
    cleanliness: string
    location_id?: string
  }
  event_id: string
  event_title: string
  event_end_time: string
  outfit_name: string
}

const DISMISSED_KEY = 'dismissed_cleanliness'

function getDismissed(): Set<string> {
  try {
    const raw = localStorage.getItem(DISMISSED_KEY)
    return new Set(raw ? JSON.parse(raw) : [])
  } catch {
    return new Set()
  }
}

function saveDismissed(set: Set<string>) {
  localStorage.setItem(DISMISSED_KEY, JSON.stringify([...set]))
}

export function CleanlinessOverlay() {
  const [prompts, setPrompts] = useState<Prompt[]>([])
  const [open, setOpen] = useState(false)

  useEffect(() => {
    fetch('/api/cleanliness-prompts')
      .then((r) => r.json())
      .then((data: Prompt[]) => {
        if (!Array.isArray(data)) return
        const dismissed = getDismissed()
        const pending = data.filter((p) => !dismissed.has(`${p.item.id}:${p.event_id}`))
        setPrompts(pending)
        if (pending.length > 0) setOpen(true)
      })
      .catch(() => {})
  }, [])

  const dismiss = (prompt: Prompt) => {
    const dismissed = getDismissed()
    dismissed.add(`${prompt.item.id}:${prompt.event_id}`)
    saveDismissed(dismissed)
    setPrompts((prev) => {
      const next = prev.filter((p) => !(p.item.id === prompt.item.id && p.event_id === prompt.event_id))
      if (next.length === 0) setOpen(false)
      return next
    })
  }

  const handleNo = (prompt: Prompt) => dismiss(prompt)

  const handleYes = async (prompt: Prompt) => {
    try {
      // Get or create Laundry Hamper location
      const hamperRes = await fetch('/api/laundry-hamper')
      const hamper = await hamperRes.json()
      if (!hamperRes.ok) throw new Error(hamper.error)

      await fetch(`/api/items/${prompt.item.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cleanliness: 'dirty', location_id: hamper.id, bag_id: null }),
      })
      toast.success(`${prompt.item.name} moved to Laundry Hamper`)
    } catch {
      toast.error('Failed to update item')
    }
    dismiss(prompt)
  }

  if (!open || prompts.length === 0) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/30 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[80vh] flex flex-col">
        <div className="flex items-center justify-between px-5 py-4 border-b border-pink-100">
          <div>
            <h2 className="font-semibold text-gray-900 text-sm">After Your Event</h2>
            <p className="text-xs text-gray-400 mt-0.5">{prompts.length} item{prompts.length !== 1 ? 's' : ''} to check</p>
          </div>
          <button
            onClick={() => {
              prompts.forEach(dismiss)
            }}
            className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 divide-y divide-pink-50">
          {prompts.map((prompt) => (
            <div key={`${prompt.item.id}:${prompt.event_id}`} className="px-5 py-4">
              <div className="flex gap-3 items-start">
                <div className="h-12 w-12 rounded-xl bg-pink-50 flex items-center justify-center overflow-hidden flex-shrink-0">
                  {prompt.item.image_url ? (
                    <img
                      src={prompt.item.image_url}
                      alt={prompt.item.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Shirt className="h-5 w-5 text-pink-300" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{prompt.item.name}</p>
                  {prompt.item.brand && (
                    <p className="text-xs text-gray-400">{prompt.item.brand}</p>
                  )}
                  <p className="text-xs text-pink-500 mt-1">
                    Worn to <span className="font-medium">{prompt.event_title}</span> · {prompt.outfit_name}
                  </p>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-3 mb-2">Is it dirty now?</p>
              <div className="flex gap-2">
                <button
                  onClick={() => handleYes(prompt)}
                  className="flex-1 rounded-xl bg-pink-500 text-white text-xs font-medium py-2 hover:bg-pink-600 transition-colors"
                >
                  Yes, move to laundry
                </button>
                <button
                  onClick={() => handleNo(prompt)}
                  className="flex-1 rounded-xl bg-gray-100 text-gray-600 text-xs font-medium py-2 hover:bg-gray-200 transition-colors"
                >
                  No, still clean
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
