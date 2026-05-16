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
  { href: '/', label: 'Home', icon: LayoutDashboard },
  { href: '/items', label: 'Wardrobe', icon: Shirt },
  { href: '/locations', label: 'Locations', icon: MapPin },
  { href: '/outfits', label: 'Outfits', icon: Sparkles },
  { href: '/donations', label: 'Donate', icon: Heart },
  { href: '/email-scan', label: 'Email', icon: Mail },
]

export function MobileNav() {
  const pathname = usePathname()

  return (
    <nav
      className="fixed bottom-0 inset-x-0 md:hidden bg-slate-900 border-t border-slate-700 z-50"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="flex">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = href === '/' ? pathname === '/' : pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-1 flex-col items-center justify-center py-2 gap-0.5 transition-colors ${
                isActive ? 'text-violet-400' : 'text-slate-500'
              }`}
            >
              <Icon className="h-5 w-5" />
              <span className="text-[9px] font-medium leading-none">{label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
