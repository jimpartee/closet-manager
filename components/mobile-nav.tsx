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
      className="fixed bottom-0 inset-x-0 md:hidden bg-white border-t border-pink-100 z-50"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="flex">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = href === '/' ? pathname === '/' : pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-1 flex-col items-center justify-center py-2.5 gap-0.5 transition-colors ${
                isActive ? 'text-pink-500' : 'text-gray-400 hover:text-pink-400'
              }`}
            >
              <Icon className={`h-5 w-5 ${isActive ? 'drop-shadow-sm' : ''}`} />
              <span className="text-[9px] font-semibold leading-none">{label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
