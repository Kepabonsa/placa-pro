// Author: Kevin Pabón
// external imports
import Link from 'next/link'

// internal imports
import { Badge } from '@/components/ui/badge'
import { CurrencyUtil } from '@/utils/CurrencyUtil'
import { DateUtil } from '@/utils/DateUtil'
import { DEAL_TAG_LABELS } from '@/constants/domain'
import type { DealHistoryItemInterface } from '@/interfaces/DealInterface'
import { PlateBadgeComponent } from '@/components/PlateBadgeComponent'
import { TrafficLightDotComponent } from '@/components/TrafficLightDotComponent'

interface HistoryItemComponentPropsInterface {
  item: DealHistoryItemInterface
}

/** History row linking to the report of a plate. */
export function HistoryItemComponent({
  item,
}: HistoryItemComponentPropsInterface): React.JSX.Element {
  return (
    <Link
      href={`/placa/${item.plate}`}
      className="flex min-h-16 items-center gap-3 rounded-xl border bg-card px-3 py-2.5 transition-colors hover:bg-muted"
    >
      <TrafficLightDotComponent status={item.trafficLight} />
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="flex items-center gap-2">
          <PlateBadgeComponent plate={item.plate} />
          <Badge variant="secondary">{DEAL_TAG_LABELS[item.dealTag]}</Badge>
        </div>
        <span className="truncate text-sm">{item.vehicleLabel ?? 'Vehículo sin datos'}</span>
      </div>
      <div className="flex flex-col items-end gap-1">
        <span className="text-sm font-semibold tabular-nums">
          {CurrencyUtil.format(item.maxOffer)}
        </span>
        <span className="text-[11px] text-muted-foreground">
          {DateUtil.formatDateTime(item.updatedAt)}
        </span>
      </div>
    </Link>
  )
}
