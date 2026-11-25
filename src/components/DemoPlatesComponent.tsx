// Author: Kevin Pabón
// external imports
import { ChevronRightIcon } from 'lucide-react'

// internal imports
import { DEMO_PLATES, QUERY_MODE_CREDIT_COSTS } from '@/constants/domain'
import { PlateBadgeComponent } from '@/components/PlateBadgeComponent'
import { TrafficLightDotComponent } from '@/components/TrafficLightDotComponent'

interface DemoPlatesComponentPropsInterface {
  disabled: boolean
  onSelect: (plate: string, ownerDocument: string) => void
}

/** One-tap access to the three mock test plates. */
export function DemoPlatesComponent({
  disabled,
  onSelect,
}: DemoPlatesComponentPropsInterface): React.JSX.Element {
  return (
    <section aria-labelledby="demo-plates-title" className="flex flex-col gap-2">
      <div className="flex items-baseline justify-between">
        <h2 id="demo-plates-title" className="text-sm font-semibold">
          Placas de prueba
        </h2>
        <span className="text-xs text-muted-foreground">
          con cédula · {QUERY_MODE_CREDIT_COSTS.full} créditos
        </span>
      </div>
      <ul className="flex flex-col gap-2">
        {DEMO_PLATES.map((demo) => (
          <li key={demo.plate}>
            <button
              type="button"
              disabled={disabled}
              onClick={() => onSelect(demo.plate, demo.ownerDocument)}
              className="flex min-h-14 w-full items-center gap-3 rounded-xl border bg-card px-3 py-2 text-left transition-colors hover:bg-muted disabled:opacity-50"
            >
              <TrafficLightDotComponent status={demo.expectedStatus} />
              <PlateBadgeComponent plate={demo.plate} />
              <span className="min-w-0 flex-1 truncate text-sm">{demo.label}</span>
              <ChevronRightIcon className="size-4 text-muted-foreground" aria-hidden />
            </button>
          </li>
        ))}
      </ul>
    </section>
  )
}
