// Author: Kevin Pabón
// external imports
import { cn } from 'cn'
import type { ReactNode } from 'react'

interface DetailRowComponentPropsInterface {
  label: string
  value: ReactNode
  emphasis?: boolean
}

/** Label / value row used inside report sections. */
export function DetailRowComponent({
  label,
  value,
  emphasis = false,
}: DetailRowComponentPropsInterface): React.JSX.Element {
  return (
    <div className="flex items-start justify-between gap-4 py-1.5">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className={cn('text-right', emphasis && 'font-semibold')}>{value}</dd>
    </div>
  )
}
