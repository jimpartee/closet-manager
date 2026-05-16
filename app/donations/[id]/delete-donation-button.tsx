'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

export function DeleteDonationButton({ donationId }: { donationId: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [confirm, setConfirm] = useState(false)

  const handleDelete = async () => {
    if (!confirm) {
      setConfirm(true)
      setTimeout(() => setConfirm(false), 3000)
      return
    }
    setLoading(true)
    try {
      const res = await fetch(`/api/donations/${donationId}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete')
      toast.success('Donation deleted and items restored to active')
      router.push('/donations')
      router.refresh()
    } catch {
      toast.error('Failed to delete donation')
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors disabled:opacity-50 ${
        confirm
          ? 'bg-red-600 text-white hover:bg-red-700'
          : 'border border-red-200 text-red-600 hover:bg-red-50'
      }`}
    >
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
      {confirm ? 'Confirm Delete' : 'Delete'}
    </button>
  )
}
