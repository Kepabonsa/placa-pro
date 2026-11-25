// Author: Kevin Pabón
// internal imports
import type { AlertSeverity, ReportSection, TrafficLightStatus } from '@/constants/domain'
import type { TrafficLightAlertInterface } from '@/interfaces/TrafficLightAssessmentInterface'

/** Traffic light labels, tones and status derivation shared by server and UI. */
export class TrafficLightUtil {
  static readonly LABELS: Record<TrafficLightStatus, string> = {
    green: 'Verde',
    yellow: 'Amarillo',
    red: 'Rojo',
  }

  static readonly SEVERITY_ORDER: Record<AlertSeverity, number> = {
    critical: 0,
    warning: 1,
    info: 2,
  }

  private static readonly SEVERITY_STATUS: Record<AlertSeverity, TrafficLightStatus> = {
    critical: 'red',
    warning: 'yellow',
    info: 'green',
  }

  private static readonly TONES: Record<
    TrafficLightStatus,
    { solid: string; soft: string; dot: string }
  > = {
    green: {
      solid: 'bg-emerald-600 text-white',
      soft: 'bg-emerald-50 text-emerald-900 ring-emerald-200',
      dot: 'bg-emerald-500',
    },
    yellow: {
      solid: 'bg-amber-400 text-amber-950',
      soft: 'bg-amber-50 text-amber-900 ring-amber-200',
      dot: 'bg-amber-400',
    },
    red: {
      solid: 'bg-red-600 text-white',
      soft: 'bg-red-50 text-red-900 ring-red-200',
      dot: 'bg-red-500',
    },
  }

  /**
   * Derives a status from the worst alert severity (no alerts means green).
   * @param alerts - Alerts to inspect.
   * @returns Red for critical, yellow for warning, green otherwise.
   */
  static fromAlerts(alerts: TrafficLightAlertInterface[]): TrafficLightStatus {
    const worstSeverity = alerts.reduce<AlertSeverity>(
      (worst, alert) =>
        TrafficLightUtil.SEVERITY_ORDER[alert.severity] < TrafficLightUtil.SEVERITY_ORDER[worst]
          ? alert.severity
          : worst,
      'info',
    )
    return TrafficLightUtil.SEVERITY_STATUS[worstSeverity]
  }

  /**
   * Status of one report section, used for the accordion indicators.
   * @param alerts - All report alerts.
   * @param section - Section to evaluate.
   * @returns Section status.
   */
  static getSectionStatus(
    alerts: TrafficLightAlertInterface[],
    section: ReportSection,
  ): TrafficLightStatus {
    return TrafficLightUtil.fromAlerts(alerts.filter((alert) => alert.section === section))
  }

  /**
   * Tailwind classes for a status.
   * @param status - Traffic light status.
   * @returns Solid (header), soft (cards) and dot classes.
   */
  static getTone(status: TrafficLightStatus): { solid: string; soft: string; dot: string } {
    return TrafficLightUtil.TONES[status]
  }
}
