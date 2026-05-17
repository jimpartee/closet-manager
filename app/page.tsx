import { BASE_URL } from '@/lib/base-url'
import Link from 'next/link'
import { Plus, Mail, Package, Heart, DollarSign, AlertTriangle, Shirt, Sparkles } from 'lucide-react'
import { Item } from '@/lib/types'

async function getDashboardData() {
  try {
    const res = await fetch(BASE_URL + '/api/items', { cache: 'no-store' })
    if (!res.ok) return { items: [], error: 'Failed to fetch items' }
    const items: Item[] = await res.json()
    return { items }
  } catch {
    return { items: [], error: 'Could not connect to database' }
  }
}

export default async function DashboardPage() {
  const { items, error } = await getDashboardData()

  const activeItems = items.filter((i) => i.status === 'active')
  const donatedItems = items.filter((i) => i.status === 'donated')
  const totalValue = activeItems.reduce((sum, i) => sum + (i.purchase_price || 0), 0)
  const recentItems = [...items].slice(0, 5)

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col gap-3 mb-8 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">My Closet</h1>
          <p className="text-sm text-pink-400 mt-1 font-medium">Your personal style sanctuary</p>
        </div>
        <div className="flex gap-2.5">
          <Link
            href="/email-scan"
            className="flex items-center gap-2 rounded-xl border border-pink-200 bg-white px-4 py-2.5 text-sm font-semibold text-pink-600 hover:bg-pink-50 transition-colors shadow-sm"
          >
            <Mail className="h-4 w-4" />
            Scan Gmail
          </Link>
          <Link
            href="/items/new"
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-pink-500 to-pink-600 px-4 py-2.5 text-sm font-semibold text-white hover:from-pink-600 hover:to-pink-700 transition-all shadow-sm shadow-pink-200"
          >
            <Plus className="h-4 w-4" />
            Add Item
          </Link>
        </div>
      </div>

      {error && (
        <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4 flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="rounded-2xl border border-pink-100 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="rounded-xl bg-pink-50 p-2.5">
              <Package className="h-4 w-4 text-pink-500" />
            </div>
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Total</span>
          </div>
          <p className="text-3xl font-bold text-gray-900">{items.length}</p>
          <p className="text-xs text-gray-400 mt-1">items</p>
        </div>

        <div className="rounded-2xl border border-pink-100 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="rounded-xl bg-green-50 p-2.5">
              <Shirt className="h-4 w-4 text-green-500" />
            </div>
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Active</span>
          </div>
          <p className="text-3xl font-bold text-gray-900">{activeItems.length}</p>
          <p className="text-xs text-gray-400 mt-1">in rotation</p>
        </div>

        <div className="rounded-2xl border border-pink-100 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="rounded-xl bg-rose-50 p-2.5">
              <Heart className="h-4 w-4 text-rose-500" />
            </div>
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Donated</span>
          </div>
          <p className="text-3xl font-bold text-gray-900">{donatedItems.length}</p>
          <p className="text-xs text-gray-400 mt-1">given away</p>
        </div>

        <div className="rounded-2xl border border-pink-100 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="rounded-xl bg-purple-50 p-2.5">
              <DollarSign className="h-4 w-4 text-purple-500" />
            </div>
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Value</span>
          </div>
          <p className="text-3xl font-bold text-gray-900">${totalValue.toFixed(0)}</p>
          <p className="text-xs text-gray-400 mt-1">invested</p>
        </div>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-2 gap-3 mb-8">
        <Link
          href="/outfits"
          className="group flex items-center gap-3 rounded-2xl bg-gradient-to-br from-pink-50 to-pink-100 border border-pink-100 p-4 hover:from-pink-100 hover:to-pink-200 transition-all"
        >
          <div className="rounded-xl bg-pink-500 p-2.5 shadow-sm shadow-pink-200 group-hover:scale-105 transition-transform">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-800">Outfits</p>
            <p className="text-xs text-pink-400">Plan your look</p>
          </div>
        </Link>
        <Link
          href="/donations"
          className="group flex items-center gap-3 rounded-2xl bg-gradient-to-br from-rose-50 to-rose-100 border border-rose-100 p-4 hover:from-rose-100 hover:to-rose-200 transition-all"
        >
          <div className="rounded-xl bg-rose-500 p-2.5 shadow-sm shadow-rose-200 group-hover:scale-105 transition-transform">
            <Heart className="h-5 w-5 text-white" />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-800">Donations</p>
            <p className="text-xs text-rose-400">Give with love</p>
          </div>
        </Link>
      </div>

      {/* Recent Items */}
      <div className="rounded-2xl border border-pink-100 bg-white shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-pink-50">
          <h2 className="text-sm font-bold text-gray-900 tracking-tight">Recent Additions</h2>
          <Link href="/items" className="text-xs font-semibold text-pink-500 hover:text-pink-600 transition-colors">
            View all →
          </Link>
        </div>
        {recentItems.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <div className="rounded-full bg-pink-50 p-4 w-fit mx-auto mb-4">
              <Shirt className="h-8 w-8 text-pink-300" />
            </div>
            <p className="text-sm font-medium text-gray-500">Your closet is empty!</p>
            <p className="text-xs text-gray-400 mt-1">Add your first item to get started.</p>
          </div>
        ) : (
          <ul className="divide-y divide-pink-50">
            {recentItems.map((item) => (
              <li key={item.id}>
                <Link
                  href={`/items/${item.id}`}
                  className="flex items-center gap-4 px-6 py-3.5 hover:bg-pink-50/50 transition-colors"
                >
                  <div className="h-11 w-11 rounded-xl bg-pink-50 flex items-center justify-center flex-shrink-0 overflow-hidden border border-pink-100">
                    {item.image_url ? (
                      <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                    ) : (
                      <Shirt className="h-5 w-5 text-pink-300" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{item.name}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {item.brand && `${item.brand} · `}
                      {item.category}
                    </p>
                  </div>
                  {item.purchase_price && (
                    <span className="text-sm font-semibold text-pink-500">${item.purchase_price}</span>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
