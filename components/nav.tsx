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
  CalendarDays,
} from 'lucide-react'

const navItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/items', label: 'Wardrobe', icon: Shirt },
  { href: '/locations', label: 'Locations', icon: MapPin },
  { href: '/donations', label: 'Donations', icon: Heart },
  { href: '/email-scan', label: 'Email Scan', icon: Mail },
  { href: '/outfits', label: 'Outfits', icon: Sparkles },
  { href: '/calendar', label: 'Calendar', icon: CalendarDays },
]

export function Nav() {
  const pathname = usePathname()

  return (
    <nav className="flex h-full w-60 flex-col bg-white border-r border-pink-100">
      <div className="flex items-center gap-2.5 px-6 py-6 border-b border-pink-100">
        <div className="rounded-xl bg-gradient-to-br from-pink-400 to-pink-600 p-1.5">
          <Shirt className="h-5 w-5 text-white" />
        </div>
        <span className="text-lg font-semibold tracking-tight text-gray-900" style={{ fontFamily: 'var(--font-heading)' }}>
          Closet Manager
        </span>
      </div>
      <div className="flex flex-col gap-0.5 p-3 flex-1">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive =
            href === '/' ? pathname === '/' : pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
                isActive
                  ? 'bg-gradient-to-r from-pink-500 to-pink-600 text-white shadow-sm shadow-pink-200'
                  : 'text-gray-500 hover:bg-pink-50 hover:text-pink-600'
              }`}
            >
              <Icon className="h-4 w-4 flex-shrink-0" />
              {label}
            </Link>
          )
        })}
      </div>
      <div className="px-4 py-4 border-t border-pink-100">
        <p className="text-[10px] text-pink-300 font-medium uppercase tracking-widest">Your Style, Organized</p>
      </div>
    </nav>
  )
}
