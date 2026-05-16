'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Shirt,
  MapPin,
  Heart,
  Mail,
  Sparkles,
} from 'lucide-react'

const navItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/items', label: 'Wardrobe', icon: Shirt },
  { href: '/locations', label: 'Locations', icon: MapPin },
  { href: '/donations', label: 'Donations', icon: Heart },
  { href: '/email-scan', label: 'Email Scan', icon: Mail },
  { href: '/outfits', label: 'Outfits', icon: Sparkles },
]

export function Nav() {
  const pathname = usePathname()

  return (
    <nav className="flex h-full w-60 flex-col bg-slate-900 text-slate-100">
      <div className="flex items-center gap-2 px-6 py-6 border-b border-slate-700">
        <Shirt className="h-6 w-6 text-violet-400" />
        <span className="text-lg font-semibold tracking-tight">Closet Manager</span>
      </div>
      <div className="flex flex-col gap-1 p-3 flex-1">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive =
            href === '/' ? pathname === '/' : pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-violet-600 text-white'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'
              }`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
