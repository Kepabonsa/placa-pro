// Author: Kevin Pabón
// internal imports
import { CurrencyUtil } from '@/utils/CurrencyUtil'
import { DateUtil } from '@/utils/DateUtil'
import { REGISTRATION_STATUS_LABELS } from '@/constants/domain'
import type {
  TrafficLightAlertInterface,
  TrafficLightAssessmentInterface,
} from '@/interfaces/TrafficLightAssessmentInterface'
import type { TrafficLightStatus } from '@/constants/domain'
import { TrafficLightUtil } from '@/utils/TrafficLightUtil'
import type { VehicleReportInterface } from '@/interfaces/VehicleReportInterface'
import { VehicleReportUtil } from '@/utils/VehicleReportUtil'

/**
 * Strict Green / Yellow / Red rules.
 * - Red (critical): inactive registration, active lien (prenda), legal limitation (embargo), theft
 *   report, total loss or theft claim in Fasecolda.
 * - Yellow (warning): SIMIT fines, pending taxes, SOAT/RTM expired or expiring within 30 days,
 *   partial loss claim.
 * - Green: none of the above.
 */
export class TrafficLightService {
  private static readonly HEADLINES: Record<TrafficLightStatus, string> = {
    green: 'Negocio limpio: papeles al día y sin deudas.',
    yellow: 'Negociable: descuenta las deudas y revisa los vencimientos.',
    red: 'No comprar sin resolver los puntos críticos.',
  }

  /**
   * Evaluates a vehicle report.
   * @param report - Normalized vehicle report.
   * @param referenceDate - Instant used as "today" for expirations (defaults to now).
   * @returns Status, headline and alerts sorted by priority (critical first).
   */
  static evaluate(
    report: VehicleReportInterface,
    referenceDate: Date = new Date(),
  ): TrafficLightAssessmentInterface {
    const alerts = [
      ...TrafficLightService.buildLegalAlerts(report),
      ...TrafficLightService.buildDebtAlerts(report),
      ...TrafficLightService.buildDocumentAlerts(report, referenceDate),
      ...TrafficLightService.buildFasecoldaAlerts(report),
    ].toSorted(
      (left, right) =>
        TrafficLightUtil.SEVERITY_ORDER[left.severity] -
        TrafficLightUtil.SEVERITY_ORDER[right.severity],
    )
    const status = TrafficLightUtil.fromAlerts(alerts)
    return { status, headline: TrafficLightService.HEADLINES[status], alerts }
  }

  private static buildLegalAlerts(report: VehicleReportInterface): TrafficLightAlertInterface[] {
    const { legal } = report
    const alerts: TrafficLightAlertInterface[] = []

    if (legal.registrationStatus !== 'active') {
      alerts.push({
        code: 'REGISTRATION_NOT_ACTIVE',
        severity: 'critical',
        section: 'legal',
        title: `Matrícula ${REGISTRATION_STATUS_LABELS[legal.registrationStatus].toLowerCase()}`,
        detail: 'El RUNT no reporta la matrícula activa: no se puede hacer el traspaso.',
      })
    }
    for (const lien of legal.liens) {
      alerts.push({
        code: 'ACTIVE_LIEN',
        severity: 'critical',
        section: 'legal',
        title: 'Prenda activa',
        detail: `A favor de ${lien.creditor} desde el ${DateUtil.formatDate(lien.registeredAt)}. Exige el levantamiento de la prenda antes de pagar.`,
      })
    }
    if (legal.legalLimitations.length > 0) {
      alerts.push({
        code: 'LEGAL_LIMITATION',
        severity: 'critical',
        section: 'legal',
        title: 'Limitación a la propiedad',
        detail: `${legal.legalLimitations.join('; ')}. No se puede traspasar hasta levantarla.`,
      })
    }
    if (legal.hasTheftReport) {
      alerts.push({
        code: 'THEFT_REPORT',
        severity: 'critical',
        section: 'legal',
        title: 'Reporte de hurto vigente',
        detail: 'El vehículo figura como hurtado. No lo compres.',
      })
    }
    return alerts
  }

  private static buildDebtAlerts(report: VehicleReportInterface): TrafficLightAlertInterface[] {
    const { debts } = report
    const alerts: TrafficLightAlertInterface[] = []

    if (debts.fines.length > 0) {
      const count = debts.fines.length
      alerts.push({
        code: 'PENDING_FINES',
        severity: 'warning',
        section: 'debts',
        title:
          count === 1
            ? '1 comparendo pendiente en SIMIT'
            : `${count} comparendos pendientes en SIMIT`,
        detail: `Total ${CurrencyUtil.format(VehicleReportUtil.getFinesTotal(debts))}. Ya se descuenta en la calculadora de oferta.`,
      })
    }
    for (const tax of VehicleReportUtil.getPendingTaxes(debts)) {
      alerts.push({
        code: 'PENDING_TAXES',
        severity: 'warning',
        section: 'debts',
        title: `Impuesto ${tax.department} ${tax.year} pendiente`,
        detail: `${CurrencyUtil.format(tax.amount)} por pagar. Ya se descuenta en la calculadora de oferta.`,
      })
    }
    return alerts
  }

  private static buildDocumentAlerts(
    report: VehicleReportInterface,
    referenceDate: Date,
  ): TrafficLightAlertInterface[] {
    const { soat, technicalInspection } = report.documents
    return [
      TrafficLightService.buildExpirationAlert('SOAT', 'SOAT', soat.expiresAt, true, referenceDate),
      TrafficLightService.buildExpirationAlert(
        'RTM',
        'Revisión técnico-mecánica',
        technicalInspection.expiresAt,
        technicalInspection.required,
        referenceDate,
      ),
    ].filter((alert): alert is TrafficLightAlertInterface => alert !== null)
  }

  private static buildExpirationAlert(
    codePrefix: string,
    documentName: string,
    expiresAt: string | null,
    required: boolean,
    referenceDate: Date,
  ): TrafficLightAlertInterface | null {
    const validity = VehicleReportUtil.getDocumentValidity(expiresAt, referenceDate, required)

    if (validity === 'expired') {
      return {
        code: `${codePrefix}_EXPIRED`,
        severity: 'warning',
        section: 'documents',
        title: `${documentName} vencido`,
        detail: expiresAt
          ? `Venció el ${DateUtil.formatDate(expiresAt)}. Suma el costo de renovarlo a la negociación.`
          : 'No registra póliza vigente. Suma el costo de expedirlo a la negociación.',
      }
    }
    if (validity === 'expiring_soon' && expiresAt) {
      const daysLeft = DateUtil.daysUntil(expiresAt, referenceDate)
      const when = daysLeft === 0 ? 'hoy' : daysLeft === 1 ? 'mañana' : `en ${daysLeft} días`
      return {
        code: `${codePrefix}_EXPIRING`,
        severity: 'warning',
        section: 'documents',
        title: `${documentName} vence ${when}`,
        detail: `Vence el ${DateUtil.formatDate(expiresAt)}. Acuerda quién asume la renovación.`,
      }
    }
    return null
  }

  private static buildFasecoldaAlerts(
    report: VehicleReportInterface,
  ): TrafficLightAlertInterface[] {
    return report.fasecolda.claims.map((claim) => {
      const happenedAt = DateUtil.formatDate(claim.occurredAt)
      if (claim.type === 'total_loss') {
        return {
          code: 'TOTAL_LOSS',
          severity: 'critical',
          section: 'fasecolda',
          title: 'Antecedente de pérdida total',
          detail: `${claim.description} (${happenedAt}). Afecta el valor de reventa y la asegurabilidad.`,
        }
      }
      if (claim.type === 'theft') {
        return {
          code: 'THEFT_CLAIM',
          severity: 'critical',
          section: 'fasecolda',
          title: 'Antecedente de hurto',
          detail: `${claim.description} (${happenedAt}). Verifica que no tenga pendientes con la aseguradora.`,
        }
      }
      return {
        code: 'PARTIAL_LOSS',
        severity: 'warning',
        section: 'fasecolda',
        title: 'Siniestro parcial registrado',
        detail: `${claim.description} (${happenedAt}). Revisa la calidad de la reparación.`,
      }
    })
  }
}
