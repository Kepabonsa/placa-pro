// Author: Kevin Pabón
// external imports
import { CircleCheckIcon, InfoIcon, OctagonXIcon, TriangleAlertIcon } from 'lucide-react'
import { cn } from 'cn'

// internal imports
import type { AlertSeverity, TrafficLightStatus } from '@/constants/domain'
import { PlateBadgeComponent } from '@/components/PlateBadgeComponent'
import type { TrafficLightAssessmentInterface } from '@/interfaces/TrafficLightAssessmentInterface'
import { TrafficLightUtil } from '@/utils/TrafficLightUtil'

interface TrafficLightHeaderComponentPropsInterface {
  assessment: TrafficLightAssessmentInterface
  plate: string
  vehicleLabel: string
  sourceNote: string
}

const STATUS_ICONS: Record<TrafficLightStatus, typeof CircleCheckIcon> = {
  green: CircleCheckIcon,
  yellow: TriangleAlertIcon,
  red: OctagonXIcon,
}

const SEVERITY_STYLES: Record<AlertSeverity, { icon: typeof CircleCheckIcon; className: string }> =
  {
    critical: { icon: OctagonXIcon, className: 'text-red-600' },
    warning: { icon: TriangleAlertIcon, className: 'text-amber-500' },
    info: { icon: InfoIcon, className: 'text-slate-500' },
  }

const GREEN_CHECKS = [
  'Sin prendas, embargos ni reporte de hurto',
  'Sin comparendos ni impuestos pendientes',
  'SOAT y RTM al día',
  'Sin siniestros en Fasecolda',
]

/** Traffic light banner with the prioritized alerts. */
export function TrafficLightHeaderComponent({
  assessment,
  plate,
  vehicleLabel,
  sourceNote,
}: TrafficLightHeaderComponentPropsInterface): React.JSX.Element {
  const StatusIcon = STATUS_ICONS[assessment.status]
  const tone = TrafficLightUtil.getTone(assessment.status)

  return (
    <section aria-labelledby="traffic-light-title" className="flex flex-col gap-3">
      <div className={cn('flex flex-col gap-3 rounded-2xl p-4 shadow-sm', tone.solid)}>
        <div className="flex items-center gap-3">
          <StatusIcon className="size-10 shrink-0" aria-hidden />
          <div className="min-w-0">
            <p
              id="traffic-light-title"
              className="text-2xl leading-none font-extrabold tracking-wide uppercase"
            >
              {TrafficLightUtil.LABELS[assessment.status]}
            </p>
            <p className="mt-1 text-sm font-medium opacity-90">{assessment.headline}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 rounded-xl bg-white/90 px-3 py-2 text-slate-900">
          <PlateBadgeComponent plate={plate} />
          <span className="min-w-0 flex-1 truncate text-sm font-semibold">{vehicleLabel}</span>
        </div>
        <p className="text-xs opacity-80">{sourceNote}</p>
      </div>

      {assessment.alerts.length > 0 ? (
        <ul className="flex flex-col gap-2" aria-label="Alertas priorizadas">
          {assessment.alerts.map((alert, position) => {
            const severityStyle = SEVERITY_STYLES[alert.severity]
            const AlertIcon = severityStyle.icon
            return (
              <li
                key={`${alert.code}-${position}`}
                className="flex gap-3 rounded-xl border bg-card px-3 py-2.5"
              >
                <AlertIcon
                  className={cn('mt-0.5 size-5 shrink-0', severityStyle.className)}
                  aria-hidden
                />
                <div className="min-w-0">
                  <p className="text-sm font-semibold">{alert.title}</p>
                  <p className="text-xs text-muted-foreground">{alert.detail}</p>
                </div>
              </li>
            )
          })}
        </ul>
      ) : (
        <ul className="flex flex-col gap-1.5 rounded-xl border bg-card px-3 py-2.5">
          {GREEN_CHECKS.map((check) => (
            <li key={check} className="flex items-center gap-2 text-sm">
              <CircleCheckIcon className="size-4 text-emerald-600" aria-hidden />
              {check}
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
