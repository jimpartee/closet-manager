'use client'

import { useState } from 'react'
import { ImagePlus, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

export function FillPhotosButton({ missingCount }: { missingCount: number }) {
  const [running, setRunning] = useState(false)
  const [progress, setProgress] = useState<{ filled: number; total: number; current: string | null } | null>(null)
  const router = useRouter()

  const handleFill = async () => {
    setRunning(true)
    setProgress({ filled: 0, total: missingCount, current: null })

    try {
      const res = await fetch('/api/items/fill-photos', { method: 'POST' })
      if (!res.body) throw new Error('No stream')

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() ?? ''

        for (const line of lines) {
          if (!line.trim()) continue
          try {
            const event = JSON.parse(line)
            setProgress({ filled: event.filled, total: event.total, current: event.current })
            if (event.done) {
              toast.success(`Added photos to ${event.filled} of ${event.total} items`)
              router.refresh()
            }
          } catch { /* skip malformed line */ }
        }
      }
    } catch {
      toast.error('Failed to fill photos')
    } finally {
      setRunning(false)
      setProgress(null)
    }
  }

  if (missingCount === 0) return null

  return (
    <button
      onClick={handleFill}
      disabled={running}
      className="flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-60"
    >
      {running ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImagePlus className="h-4 w-4" />}
      {running && progress
        ? `${progress.filled}/${progress.total} — ${progress.current ?? 'searching...'}`
        : `Fill ${missingCount} missing photo${missingCount !== 1 ? 's' : ''}`}
    </button>
  )
}
