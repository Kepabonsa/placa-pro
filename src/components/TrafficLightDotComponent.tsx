// Author: Kevin Pabón
// external imports
import { cn } from 'cn'

// internal imports
import type { TrafficLightStatus } from '@/constants/domain'
import { TrafficLightUtil } from '@/utils/TrafficLightUtil'

interface TrafficLightDotComponentPropsInterface {
  status: TrafficLightStatus | null
  className?: string
}

/** Small colored circle that summarizes a traffic light status. */
export function TrafficLightDotComponent({
  status,
  className,
}: TrafficLightDotComponentPropsInterface): React.JSX.Element {
  const label = status
    ? `Semáforo ${TrafficLightUtil.LABELS[status].toLowerCase()}`
    : 'Sin semáforo'
  return (
    <span
      role="img"
      aria-label={label}
      title={label}
      className={cn(
        'inline-block size-3 shrink-0 rounded-full',
        status ? TrafficLightUtil.getTone(status).dot : 'bg-slate-300',
        className,
      )}
    />
  )
}
