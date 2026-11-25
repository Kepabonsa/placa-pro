// Author: Kevin Pabón
// external imports
import { Geist, Geist_Mono } from 'next/font/google'
import type { Metadata, Viewport } from 'next'
import { Suspense } from 'react'

// internal imports
import { ActiveBottomNavComponent } from '@/components/ActiveBottomNavComponent'
import { BottomNavComponent } from '@/components/BottomNavComponent'
import { Toaster } from '@/components/ui/sonner'
import './globals.css'

const geistSans = Geist({
  variable: '--font-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: { default: 'PlacaPro', template: '%s · PlacaPro' },
  description: 'Valida vehículos usados y calcula tu oferta máxima en segundos.',
  applicationName: 'PlacaPro',
  manifest: '/manifest.webmanifest',
  appleWebApp: { capable: true, title: 'PlacaPro', statusBarStyle: 'default' },
  icons: {
    icon: '/icon.svg',
    apple: '/apple-touch-icon.png',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#0f172a',
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>): React.JSX.Element {
  return (
    <html lang="es-CO" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-dvh bg-slate-100">
        <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col bg-background shadow-sm">
          <main className="flex flex-1 flex-col pb-[calc(4rem+env(safe-area-inset-bottom))]">
            {children}
          </main>
          <Suspense fallback={<BottomNavComponent activeHref={null} />}>
            <ActiveBottomNavComponent />
          </Suspense>
        </div>
        <Toaster position="top-center" richColors />
      </body>
    </html>
  )
}
