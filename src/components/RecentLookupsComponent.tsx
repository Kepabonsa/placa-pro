// Author: Kevin Pabón
// external imports
import Link from 'next/link'

// internal imports
import type { DealHistoryItemInterface } from '@/interfaces/DealInterface'
import { HistoryItemComponent } from '@/components/HistoryItemComponent'
import { Skeleton } from '@/components/ui/skeleton'

interface RecentLookupsComponentPropsInterface {
  items: DealHistoryItemInterface[]
  isLoading: boolean
}

/** Last vehicles validated, shown on the home screen. */
export function RecentLookupsComponent({
  items,
  isLoading,
}: RecentLookupsComponentPropsInterface): React.JSX.Element {
  return (
    <section aria-labelledby="recent-title" className="flex flex-col gap-2">
      <div className="flex items-baseline justify-between">
        <h2 id="recent-title" className="text-sm font-semibold">
          Historial reciente
        </h2>
        <Link href="/historial" className="text-xs font-medium text-slate-700 underline">
          Ver todo
        </Link>
      </div>
      {isLoading ? (
        <Skeleton className="h-16 w-full rounded-xl" />
      ) : items.length === 0 ? (
        <p className="rounded-xl border border-dashed px-3 py-4 text-center text-sm text-muted-foreground">
          Aún no has validado vehículos.
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {items.map((item) => (
            <li key={item.plate}>
              <HistoryItemComponent item={item} />
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
