import type { Metadata, Viewport } from 'next'
import { Plus_Jakarta_Sans, Playfair_Display, DM_Mono } from 'next/font/google'
import './globals.css'
import { Nav } from '@/components/nav'
import { MobileNav } from '@/components/mobile-nav'
import { Toaster } from '@/components/ui/sonner'
import { CleanlinessOverlay } from '@/components/cleanliness-overlay'

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: '--font-sans',
  subsets: ['latin'],
  display: 'swap',
})

const playfairDisplay = Playfair_Display({
  variable: '--font-heading',
  subsets: ['latin'],
  display: 'swap',
})

const dmMono = DM_Mono({
  variable: '--font-mono',
  subsets: ['latin'],
  weight: ['400', '500'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Closet Manager',
  description: 'Manage your wardrobe with AI',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      className={`${plusJakartaSans.variable} ${playfairDisplay.variable} ${dmMono.variable} h-full antialiased`}
    >
      <body className="h-full flex bg-background">
        <div className="flex h-full w-full">
          <aside className="h-full flex-shrink-0 hidden md:flex">
            <Nav />
          </aside>
          <main className="flex-1 overflow-auto pb-mobile-nav md:pb-0">{children}</main>
        </div>
        <MobileNav />
        <Toaster />
        <CleanlinessOverlay />
      </body>
    </html>
  )
}
