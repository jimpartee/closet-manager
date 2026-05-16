import Link from 'next/link'
import { Plus, Mail, Package, Heart, DollarSign, AlertTriangle, Shirt } from 'lucide-react'
import { Item } from '@/lib/types'

async function getDashboardData() {
  const missingEnvVars =
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    process.env.NEXT_PUBLIC_SUPABASE_URL === 'your_supabase_url'

  if (missingEnvVars) {
    return { missingEnvVars: true, items: [] }
  }

  try {
    const res = await fetch('http://localhost:3000/api/items', {
      cache: 'no-store',
    })
    if (!res.ok) return { missingEnvVars: false, items: [], error: 'Failed to fetch items' }
    const items: Item[] = await res.json()
    return { missingEnvVars: false, items }
  } catch {
    return { missingEnvVars: false, items: [], error: 'Could not connect to database' }
  }
}

export default async function DashboardPage() {
  const { missingEnvVars, items, error } = await getDashboardData()

  const activeItems = items.filter((i) => i.status === 'active')
  const donatedItems = items.filter((i) => i.status === 'donated')
  const totalValue = activeItems.reduce((sum, i) => sum + (i.purchase_price || 0), 0)
  const recentItems = [...items].slice(0, 5)

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">Welcome to your Closet Manager</p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/email-scan"
            className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <Mail className="h-4 w-4" />
            Scan Gmail
          </Link>
          <Link
            href="/items/new"
            className="flex items-center gap-2 rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Quick Add
          </Link>
        </div>
      </div>

      {missingEnvVars && (
        <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 p-4 flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-amber-800">Setup Required</p>
            <p className="text-sm text-amber-700 mt-1">
              Configure your environment variables in <code className="bg-amber-100 px-1 rounded">.env.local</code> to connect to Supabase and enable all features.
            </p>
          </div>
        </div>
      )}

      {error && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="rounded-lg bg-violet-50 p-2">
              <Package className="h-4 w-4 text-violet-600" />
            </div>
            <span className="text-sm text-gray-500">Total Items</span>
          </div>
          <p className="text-2xl font-semibold text-gray-900">{items.length}</p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="rounded-lg bg-green-50 p-2">
              <Shirt className="h-4 w-4 text-green-600" />
            </div>
            <span className="text-sm text-gray-500">Active</span>
          </div>
          <p className="text-2xl font-semibold text-gray-900">{activeItems.length}</p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="rounded-lg bg-amber-50 p-2">
              <Heart className="h-4 w-4 text-amber-600" />
            </div>
            <span className="text-sm text-gray-500">Donated</span>
          </div>
          <p className="text-2xl font-semibold text-gray-900">{donatedItems.length}</p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="rounded-lg bg-blue-50 p-2">
              <DollarSign className="h-4 w-4 text-blue-600" />
            </div>
            <span className="text-sm text-gray-500">Total Value</span>
          </div>
          <p className="text-2xl font-semibold text-gray-900">
            ${totalValue.toFixed(0)}
          </p>
        </div>
      </div>

      {/* Recent Items */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-sm font-medium text-gray-900">Recent Items</h2>
          <Link href="/items" className="text-sm text-violet-600 hover:text-violet-700">
            View all
          </Link>
        </div>
        {recentItems.length === 0 ? (
          <div className="px-6 py-10 text-center">
            <Shirt className="h-8 w-8 text-gray-300 mx-auto mb-3" />
            <p className="text-sm text-gray-500">No items yet. Add your first item!</p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {recentItems.map((item) => (
              <li key={item.id}>
                <Link
                  href={`/items/${item.id}`}
                  className="flex items-center gap-4 px-6 py-3 hover:bg-gray-50 transition-colors"
                >
                  <div className="h-10 w-10 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
                    {item.image_url ? (
                      <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                    ) : (
                      <Shirt className="h-5 w-5 text-gray-400" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{item.name}</p>
                    <p className="text-xs text-gray-500">
                      {item.brand && `${item.brand} · `}
                      {item.category}
                    </p>
                  </div>
                  {item.purchase_price && (
                    <span className="text-sm text-gray-500">${item.purchase_price}</span>
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
