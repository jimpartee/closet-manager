'use client'

import { useState } from 'react'
import { ImagePlus, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

export function FetchPhotoButton({ itemId }: { itemId: string }) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleFetch = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/items/${itemId}/fetch-photo`, { method: 'POST' })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error || 'Could not fetch photo')
      } else {
        toast.success('Photo added!')
        router.refresh()
      }
    } catch {
      toast.error('Failed to fetch photo')
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleFetch}
      disabled={loading}
      className="flex items-center gap-2 rounded-lg border border-dashed border-gray-300 px-4 py-2 text-sm font-medium text-gray-500 hover:border-violet-400 hover:text-violet-600 transition-colors disabled:opacity-50"
    >
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImagePlus className="h-4 w-4" />}
      {loading ? 'Fetching...' : 'Fetch photo from URL'}
    </button>
  )
}
