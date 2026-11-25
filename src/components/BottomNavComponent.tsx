// Author: Kevin Pabón
// external imports
import { cn } from 'cn'
import { HistoryIcon, SearchIcon } from 'lucide-react'
import Link from 'next/link'

interface BottomNavComponentPropsInterface {
  activeHref: string | null
}

const NAV_ITEMS = [
  { href: '/', label: 'Validar', icon: SearchIcon },
  { href: '/historial', label: 'Historial', icon: HistoryIcon },
] as const

/** Thumb-friendly bottom navigation. `activeHref` is null while the pathname is unknown. */
export function BottomNavComponent({
  activeHref,
}: BottomNavComponentPropsInterface): React.JSX.Element {
  return (
    <nav
      aria-label="Navegación principal"
      className="fixed inset-x-0 bottom-0 z-40 mx-auto max-w-md border-t bg-background/95 pb-[env(safe-area-inset-bottom)] backdrop-blur"
    >
      <ul className="grid grid-cols-2">
        {NAV_ITEMS.map((item) => {
          const isActive = item.href === activeHref
          const Icon = item.icon
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={isActive ? 'page' : undefined}
                className={cn(
                  'flex h-16 flex-col items-center justify-center gap-1 text-xs font-medium transition-colors',
                  isActive ? 'text-slate-900' : 'text-muted-foreground',
                )}
              >
                <Icon className={cn('size-6', isActive && 'stroke-[2.5]')} aria-hidden />
                {item.label}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
