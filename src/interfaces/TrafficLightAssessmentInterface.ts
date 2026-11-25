// Author: Kevin Pabón
// internal imports
import type { AlertSeverity, ReportSection, TrafficLightStatus } from '@/constants/domain'

/** A single finding shown in the traffic light header and its report section. */
export interface TrafficLightAlertInterface {
  code: string
  severity: AlertSeverity
  section: ReportSection
  title: string
  detail: string
}

/** Result of applying the Green/Yellow/Red rules to a vehicle report. */
export interface TrafficLightAssessmentInterface {
  status: TrafficLightStatus
  headline: string
  alerts: TrafficLightAlertInterface[]
}
