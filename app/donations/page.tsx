import { BASE_URL } from '@/lib/base-url'
import Link from 'next/link'
import { Plus, Heart, Calendar, Package, DollarSign } from 'lucide-react'
import { Donation } from '@/lib/types'
import { format } from 'date-fns'

async function getDonations(): Promise<Donation[]> {
  try {
    const res = await fetch(BASE_URL + '/api/donations', { cache: 'no-store' })
    if (!res.ok) return []
    return res.json()
  } catch {
    return []
  }
}

export default async function DonationsPage() {
  const donations = await getDonations()

  const totalValue = donations.reduce((sum, d) => sum + (d.total_estimated_value || 0), 0)
  const totalItems = donations.reduce(
    (sum, d) => sum + (d.donation_items?.length || 0),
    0
  )

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Donations</h1>
          <p className="text-sm text-gray-500 mt-1">Track your charitable giving</p>
        </div>
        <Link
          href="/donations/new"
          className="flex items-center gap-2 rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          New Donation
        </Link>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="rounded-lg bg-rose-50 p-2">
              <Heart className="h-4 w-4 text-rose-500" />
            </div>
            <span className="text-sm text-gray-500">Donations</span>
          </div>
          <p className="text-2xl font-semibold text-gray-900">{donations.length}</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="rounded-lg bg-amber-50 p-2">
              <Package className="h-4 w-4 text-amber-500" />
            </div>
            <span className="text-sm text-gray-500">Items Donated</span>
          </div>
          <p className="text-2xl font-semibold text-gray-900">{totalItems}</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="rounded-lg bg-green-50 p-2">
              <DollarSign className="h-4 w-4 text-green-500" />
            </div>
            <span className="text-sm text-gray-500">Total Value</span>
          </div>
          <p className="text-2xl font-semibold text-gray-900">${totalValue.toFixed(0)}</p>
        </div>
      </div>

      {/* List */}
      {donations.length === 0 ? (
        <div className="rounded-xl border border-gray-200 bg-white p-12 text-center">
          <Heart className="h-10 w-10 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No donations recorded yet.</p>
          <Link
            href="/donations/new"
            className="mt-4 inline-flex items-center gap-2 text-sm text-violet-600 hover:text-violet-700"
          >
            <Plus className="h-4 w-4" />
            Record your first donation
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {donations.map((donation) => (
            <Link key={donation.id} href={`/donations/${donation.id}`}>
              <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm hover:shadow-md transition-shadow flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="rounded-full bg-rose-50 p-3">
                    <Heart className="h-5 w-5 text-rose-500" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">{donation.organization}</h3>
                    <div className="flex items-center gap-4 mt-1">
                      <span className="flex items-center gap-1 text-xs text-gray-500">
                        <Calendar className="h-3 w-3" />
                        {format(new Date(donation.donation_date), 'MMM d, yyyy')}
                      </span>
                      <span className="flex items-center gap-1 text-xs text-gray-500">
                        <Package className="h-3 w-3" />
                        {donation.donation_items?.length || 0} items
                      </span>
                    </div>
                  </div>
                </div>
                {donation.total_estimated_value && (
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">
                      ${donation.total_estimated_value.toFixed(2)}
                    </p>
                    <p className="text-xs text-gray-400">estimated value</p>
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
