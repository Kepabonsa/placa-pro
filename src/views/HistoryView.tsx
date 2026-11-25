// Author: Kevin Pabón
'use client'

// external imports
import { cn } from 'cn'
import { SearchIcon } from 'lucide-react'
import { toast } from 'sonner'
import { useEffect, useState } from 'react'

// internal imports
import { AppHeaderComponent } from '@/components/AppHeaderComponent'
import { DealApiService } from '@/services/DealApiService'
import type { DealHistoryItemInterface } from '@/interfaces/DealInterface'
import type { DealTag } from '@/constants/domain'
import { DealTagChipsComponent } from '@/components/DealTagChipsComponent'
import { ErrorUtil } from '@/utils/ErrorUtil'
import { HistoryItemComponent } from '@/components/HistoryItemComponent'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { useDebouncedValue } from '@/hooks/useDebouncedValue'

const SEARCH_DEBOUNCE_MS = 300

interface LoadedHistoryInterface {
  requestKey: string
  items: DealHistoryItemInterface[]
}

/** History filterable by plate and commercial tag. */
export function HistoryView(): React.JSX.Element {
  const [plateQuery, setPlateQuery] = useState('')
  const [dealTag, setDealTag] = useState<DealTag | null>(null)
  const [loaded, setLoaded] = useState<LoadedHistoryInterface | null>(null)
  const debouncedPlate = useDebouncedValue(plateQuery, SEARCH_DEBOUNCE_MS)
  const requestKey = `${debouncedPlate}|${dealTag ?? ''}`

  useEffect(() => {
    let isActive = true
    DealApiService.findAll({ plate: debouncedPlate, dealTag: dealTag ?? undefined })
      .then((items) => {
        if (isActive) {
          setLoaded({ requestKey, items })
        }
      })
      .catch((error: unknown) => {
        if (isActive) {
          setLoaded({ requestKey, items: [] })
          toast.error(ErrorUtil.getMessage(error))
        }
      })
    return (): void => {
      isActive = false
    }
  }, [debouncedPlate, dealTag, requestKey])

  const isLoading = loaded?.requestKey !== requestKey
  const items = loaded?.items ?? []
  const hasFilters = plateQuery.trim() !== '' || dealTag !== null

  return (
    <>
      <AppHeaderComponent
        title="Historial"
        subtitle={loaded ? `${items.length} vehículo(s)` : 'Cargando…'}
      />
      <div className="flex flex-col gap-4 px-4 py-4">
        <div className="relative">
          <SearchIcon
            className="pointer-events-none absolute top-1/2 left-3 size-5 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <Input
            type="search"
            value={plateQuery}
            onChange={(event) => setPlateQuery(event.target.value.toUpperCase())}
            placeholder="Buscar placa"
            aria-label="Buscar por placa"
            autoCapitalize="characters"
            autoComplete="off"
            className="h-12 rounded-xl pl-10 font-mono text-lg tracking-widest uppercase"
          />
        </div>
        <DealTagChipsComponent
          label="Filtrar por etiqueta"
          value={dealTag}
          onChange={setDealTag}
          allowAll
        />

        {loaded === null ? (
          <div className="flex flex-col gap-2">
            <Skeleton className="h-16 w-full rounded-xl" />
            <Skeleton className="h-16 w-full rounded-xl" />
          </div>
        ) : items.length === 0 ? (
          <p className="rounded-xl border border-dashed px-3 py-8 text-center text-sm text-muted-foreground">
            {hasFilters
              ? 'No hay vehículos con esos filtros.'
              : 'Aún no has validado vehículos. Empieza desde Validar.'}
          </p>
        ) : (
          <ul
            className={cn('flex flex-col gap-2 transition-opacity', isLoading && 'opacity-60')}
            aria-busy={isLoading}
          >
            {items.map((item) => (
              <li key={item.plate}>
                <HistoryItemComponent item={item} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  )
}
