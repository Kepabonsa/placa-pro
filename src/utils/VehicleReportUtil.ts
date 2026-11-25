// Author: Kevin Pabón
// internal imports
import { DateUtil } from '@/utils/DateUtil'
import { DOCUMENT_EXPIRING_SOON_DAYS } from '@/constants/domain'
import type { DocumentValidity } from '@/constants/domain'
import type {
  VehicleDebtsInterface,
  VehicleIdentityInterface,
  VehicleReportInterface,
  VehicleTaxInterface,
} from '@/interfaces/VehicleReportInterface'

/** Read-only helpers over a normalized vehicle report. */
export class VehicleReportUtil {
  /**
   * Builds the short vehicle name used across the UI.
   * @param vehicle - Vehicle identity.
   * @returns Label such as "Mazda CX-30 2022".
   */
  static getLabel(vehicle: VehicleIdentityInterface): string {
    return `${vehicle.brand} ${vehicle.line} ${vehicle.modelYear}`
  }

  /**
   * Sums all outstanding SIMIT fines.
   * @param debts - Report debts.
   * @returns Total in COP.
   */
  static getFinesTotal(debts: VehicleDebtsInterface): number {
    return debts.fines.reduce((total, fine) => total + fine.amount, 0)
  }

  /**
   * Lists the taxes that are still unpaid.
   * @param debts - Report debts.
   * @returns Pending taxes.
   */
  static getPendingTaxes(debts: VehicleDebtsInterface): VehicleTaxInterface[] {
    return debts.taxes.filter((tax) => tax.status === 'pending')
  }

  /**
   * Sums all unpaid departmental taxes.
   * @param debts - Report debts.
   * @returns Total in COP.
   */
  static getPendingTaxesTotal(debts: VehicleDebtsInterface): number {
    return VehicleReportUtil.getPendingTaxes(debts).reduce((total, tax) => total + tax.amount, 0)
  }

  /**
   * Debts the buyer inherits: SIMIT fines plus pending taxes.
   * @param report - Vehicle report.
   * @returns Total in COP.
   */
  static getDetectedDebts(report: VehicleReportInterface): number {
    return (
      VehicleReportUtil.getFinesTotal(report.debts) +
      VehicleReportUtil.getPendingTaxesTotal(report.debts)
    )
  }

  /**
   * Classifies a SOAT or RTM expiration date.
   * @param expiresAt - Expiration date (YYYY-MM-DD) or null when there is no document.
   * @param referenceDate - Instant used as "today".
   * @param required - False when the document does not apply (e.g. RTM of a new car).
   * @returns Document validity.
   */
  static getDocumentValidity(
    expiresAt: string | null,
    referenceDate: Date,
    required: boolean = true,
  ): DocumentValidity {
    if (!required) {
      return 'not_required'
    }
    if (!expiresAt) {
      return 'expired'
    }
    const daysLeft = DateUtil.daysUntil(expiresAt, referenceDate)
    if (daysLeft < 0) {
      return 'expired'
    }
    return daysLeft <= DOCUMENT_EXPIRING_SOON_DAYS ? 'expiring_soon' : 'valid'
  }
}
