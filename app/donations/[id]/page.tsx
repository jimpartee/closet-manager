import { BASE_URL } from '@/lib/base-url'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Calendar, Package, DollarSign, ArrowLeft } from 'lucide-react'
import { Donation } from '@/lib/types'
import { format } from 'date-fns'
import { PrintButton } from './print-button'
import { DeleteDonationButton } from './delete-donation-button'

async function getDonation(id: string): Promise<Donation | null> {
  try {
    const res = await fetch(`${BASE_URL}/api/donations/${id}`, { cache: 'no-store' })
    if (!res.ok) return null
    return res.json()
  } catch {
    return null
  }
}

export default async function DonationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const donation = await getDonation(id)

  if (!donation) notFound()

  const donationItems = donation.donation_items || []
  const totalValue = donationItems.reduce((sum, di) => sum + (di.estimated_value || 0), 0)

  return (
    <div className="p-4 md:p-6 max-w-3xl mx-auto">
      {/* Screen view */}
      <div className="print:hidden">
        <div className="flex items-center justify-between mb-6">
          <Link href="/donations" className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700">
            <ArrowLeft className="h-4 w-4" />
            Back to Donations
          </Link>
          <div className="flex gap-3">
            <PrintButton />
            <DeleteDonationButton donationId={id} />
          </div>
        </div>
      </div>

      {/* Printable content */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm print:shadow-none print:border-none">
        <div className="p-6 border-b border-gray-100">
          <h1 className="text-2xl font-semibold text-gray-900">
            Clothing Donation Receipt
          </h1>
          <div className="mt-4 grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Organization</p>
              <p className="text-base font-medium text-gray-900 mt-1">{donation.organization}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Donation Date</p>
              <p className="text-base font-medium text-gray-900 mt-1">
                {format(new Date(donation.donation_date), 'MMMM d, yyyy')}
              </p>
            </div>
          </div>
          {donation.notes && (
            <div className="mt-4">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Notes</p>
              <p className="text-sm text-gray-700 mt-1">{donation.notes}</p>
            </div>
          )}
        </div>

        {/* Item list */}
        <div className="p-6">
          <h2 className="text-sm font-medium text-gray-700 mb-4">Itemized List</h2>
          {donationItems.length === 0 ? (
            <p className="text-sm text-gray-400">No items recorded.</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left pb-2 text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Item Description
                  </th>
                  <th className="text-left pb-2 text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Brand
                  </th>
                  <th className="text-left pb-2 text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Condition
                  </th>
                  <th className="text-right pb-2 text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Est. Value
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {donationItems.map((di) => (
                  <tr key={di.id}>
                    <td className="py-3 pr-4">
                      <p className="font-medium text-gray-900">{di.item?.name}</p>
                      <p className="text-xs text-gray-500">
                        {[di.item?.category, di.item?.color, di.item?.size && `Size ${di.item.size}`]
                          .filter(Boolean)
                          .join(' · ')}
                      </p>
                    </td>
                    <td className="py-3 pr-4 text-gray-700">{di.item?.brand || '—'}</td>
                    <td className="py-3 pr-4 text-gray-700">Good</td>
                    <td className="py-3 text-right font-medium text-gray-900">
                      {di.estimated_value ? `$${di.estimated_value.toFixed(2)}` : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-gray-200">
                  <td colSpan={3} className="pt-4 font-semibold text-gray-900">
                    Total Estimated Value
                  </td>
                  <td className="pt-4 text-right font-semibold text-gray-900">
                    ${totalValue.toFixed(2)}
                  </td>
                </tr>
              </tfoot>
            </table>
          )}
        </div>

        {/* IRS note */}
        <div className="px-6 pb-6">
          <div className="rounded-lg bg-gray-50 border border-gray-100 p-4">
            <p className="text-xs text-gray-500 leading-relaxed">
              <strong>IRS Notice:</strong> No goods or services were received in exchange for this donation.
              The estimated values above are the donor&apos;s good-faith estimate of fair market value.
              For donations of clothing valued at more than $500, IRS Form 8283 may be required.
              Consult a tax professional for guidance.
            </p>
          </div>
        </div>
      </div>

      {/* Stats below print area */}
      <div className="mt-4 grid grid-cols-3 gap-4 print:hidden">
        <div className="rounded-lg border border-gray-200 bg-white p-4 flex items-center gap-3">
          <Package className="h-5 w-5 text-gray-400" />
          <div>
            <p className="text-xs text-gray-500">Items</p>
            <p className="font-semibold">{donationItems.length}</p>
          </div>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4 flex items-center gap-3">
          <Calendar className="h-5 w-5 text-gray-400" />
          <div>
            <p className="text-xs text-gray-500">Date</p>
            <p className="font-semibold">
              {format(new Date(donation.donation_date), 'MMM d, yyyy')}
            </p>
          </div>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4 flex items-center gap-3">
          <DollarSign className="h-5 w-5 text-gray-400" />
          <div>
            <p className="text-xs text-gray-500">Est. Value</p>
            <p className="font-semibold">${totalValue.toFixed(2)}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
