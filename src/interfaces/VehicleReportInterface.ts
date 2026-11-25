// Author: Kevin Pabón
// internal imports
import type {
  ClaimType,
  RegistrationStatus,
  TaxStatus,
  VehicleProviderName,
} from '@/constants/domain'

/** Vehicle identity as registered in RUNT. Dates use the YYYY-MM-DD format. */
export interface VehicleIdentityInterface {
  brand: string
  line: string
  version: string
  modelYear: number
  color: string
  bodyType: string
  serviceType: string
  fuelType: string
  engineDisplacementCc: number
  transitAuthority: string
  registeredAt: string
}

/** Pledge (prenda) registered in favor of a creditor. */
export interface VehicleLienInterface {
  creditor: string
  registeredAt: string
}

export interface VehicleLegalInterface {
  registrationStatus: RegistrationStatus
  ownerCount: number
  liens: VehicleLienInterface[]
  legalLimitations: string[]
  hasTheftReport: boolean
}

/** Outstanding SIMIT traffic fine (comparendo). */
export interface TrafficFineInterface {
  code: string
  infraction: string
  issuedAt: string
  city: string
  amount: number
}

/** Departmental vehicle tax for a given year. */
export interface VehicleTaxInterface {
  department: string
  year: number
  amount: number
  status: TaxStatus
}

export interface VehicleDebtsInterface {
  fines: TrafficFineInterface[]
  taxes: VehicleTaxInterface[]
}

/** Mandatory insurance. `expiresAt` is null when the vehicle has no SOAT. */
export interface SoatInterface {
  insurer: string | null
  policyNumber: string | null
  expiresAt: string | null
}

/** Technical inspection (RTM). New private vehicles are exempt during their first years. */
export interface TechnicalInspectionInterface {
  required: boolean
  expiresAt: string | null
  inspectionCenter: string | null
}

export interface VehicleDocumentsInterface {
  soat: SoatInterface
  technicalInspection: TechnicalInspectionInterface
}

export interface InsuranceClaimInterface {
  type: ClaimType
  occurredAt: string
  insurer: string
  description: string
}

/** Fasecolda reference value (COP) and claims history. */
export interface VehicleFasecoldaInterface {
  code: string
  referenceValue: number
  claims: InsuranceClaimInterface[]
}

/** Normalized vehicle report returned by any VehicleProviderInterface implementation. */
export interface VehicleReportInterface {
  plate: string
  provider: VehicleProviderName
  fetchedAt: string
  vehicle: VehicleIdentityInterface
  legal: VehicleLegalInterface
  debts: VehicleDebtsInterface
  documents: VehicleDocumentsInterface
  fasecolda: VehicleFasecoldaInterface
}
