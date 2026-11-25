// Author: Kevin Pabón
// external imports
import { cn } from 'cn'

// internal imports
import { PlateUtil } from '@/utils/PlateUtil'

interface PlateBadgeComponentPropsInterface {
  plate: string
  size?: 'sm' | 'lg'
  className?: string
}

/** Yellow Colombian private-vehicle plate. */
export function PlateBadgeComponent({
  plate,
  size = 'sm',
  className,
}: PlateBadgeComponentPropsInterface): React.JSX.Element {
  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center justify-center rounded-md border-2 border-slate-900 bg-yellow-400 font-mono font-bold tracking-widest text-slate-900',
        size === 'lg' ? 'px-3 py-1 text-xl' : 'px-1.5 py-0.5 text-xs',
        className,
      )}
    >
      {PlateUtil.format(plate)}
    </span>
  )
}
