import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import { Nav } from '@/components/nav'
import { MobileNav } from '@/components/mobile-nav'
import { Toaster } from '@/components/ui/sonner'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
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
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="h-full flex bg-gray-50">
        <div className="flex h-full w-full">
          <aside className="h-full flex-shrink-0 hidden md:flex">
            <Nav />
          </aside>
          <main className="flex-1 overflow-auto pb-mobile-nav md:pb-0">{children}</main>
        </div>
        <MobileNav />
        <Toaster />
      </body>
    </html>
  )
}
