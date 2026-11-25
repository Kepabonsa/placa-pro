// Author: Kevin Pabón
'use client'

// external imports
import { usePathname } from 'next/navigation'

// internal imports
import { BottomNavComponent } from '@/components/BottomNavComponent'

/** Bottom navigation with the current section highlighted (needs a Suspense boundary). */
export function ActiveBottomNavComponent(): React.JSX.Element {
  const pathname = usePathname()
  const activeHref = pathname.startsWith('/historial') ? '/historial' : '/'
  return <BottomNavComponent activeHref={activeHref} />
}
