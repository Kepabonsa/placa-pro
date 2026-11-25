// Author: Kevin Pabón
// internal imports
import { Skeleton } from '@/components/ui/skeleton'

/** Placeholder while a report loads. */
export function ReportSkeletonComponent(): React.JSX.Element {
  return (
    <div className="flex flex-col gap-4 p-4" aria-busy="true" aria-label="Cargando reporte">
      <Skeleton className="h-36 w-full rounded-2xl" />
      <Skeleton className="h-16 w-full rounded-xl" />
      <Skeleton className="h-64 w-full rounded-2xl" />
      <Skeleton className="h-48 w-full rounded-2xl" />
    </div>
  )
}
