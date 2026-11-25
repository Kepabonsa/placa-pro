// Author: Kevin Pabón
// external imports
import { ArrowLeftIcon, CoinsIcon } from 'lucide-react'
import Link from 'next/link'

interface AppHeaderComponentPropsInterface {
  title: string
  subtitle?: string
  creditBalance?: number | null
  backHref?: string
}

/** Sticky screen header with optional back link and credit balance. */
export function AppHeaderComponent({
  title,
  subtitle,
  creditBalance,
  backHref,
}: AppHeaderComponentPropsInterface): React.JSX.Element {
  return (
    <header className="sticky top-0 z-30 flex items-center gap-3 border-b bg-background/95 px-4 pt-[max(env(safe-area-inset-top),0.75rem)] pb-3 backdrop-blur">
      {backHref ? (
        <Link
          href={backHref}
          aria-label="Volver"
          className="-ml-2 flex size-11 items-center justify-center rounded-full hover:bg-muted"
        >
          <ArrowLeftIcon className="size-5" aria-hidden />
        </Link>
      ) : null}
      <div className="min-w-0 flex-1">
        <h1 className="truncate text-lg leading-tight font-semibold">{title}</h1>
        {subtitle ? <p className="truncate text-xs text-muted-foreground">{subtitle}</p> : null}
      </div>
      {creditBalance === undefined ? null : (
        <span
          className="flex items-center gap-1.5 rounded-full bg-slate-900 px-3 py-1.5 text-sm font-semibold text-white"
          aria-label={`${creditBalance ?? '—'} créditos disponibles`}
        >
          <CoinsIcon className="size-4 text-yellow-400" aria-hidden />
          {creditBalance ?? '—'}
        </span>
      )}
    </header>
  )
}
