// Author: Kevin Pabón
/** Traffic light outcomes of a vehicle assessment. */
export const TRAFFIC_LIGHT_STATUSES = ['green', 'yellow', 'red'] as const
export type TrafficLightStatus = (typeof TRAFFIC_LIGHT_STATUSES)[number]

/** Alert severities, in priority order. */
export const ALERT_SEVERITIES = ['critical', 'warning', 'info'] as const
export type AlertSeverity = (typeof ALERT_SEVERITIES)[number]

/** Report sections shown as accordions, in display order. */
export const REPORT_SECTIONS = ['legal', 'debts', 'documents', 'fasecolda'] as const
export type ReportSection = (typeof REPORT_SECTIONS)[number]

export const REPORT_SECTION_LABELS: Record<ReportSection, string> = {
  legal: 'Legal / RUNT',
  debts: 'Deudas SIMIT + Impuestos',
  documents: 'SOAT / RTM',
  fasecolda: 'Fasecolda / Siniestros',
}

/** Commercial tags a dealer assigns to a negotiation. */
export const DEAL_TAGS = ['new', 'negotiating', 'bought', 'discarded'] as const
export type DealTag = (typeof DEAL_TAGS)[number]

export const DEAL_TAG_LABELS: Record<DealTag, string> = {
  new: 'Nuevo',
  negotiating: 'En negociación',
  bought: 'Comprado',
  discarded: 'Descartado',
}

/** Provider query modes: plate + owner document (cheap) or plate only. */
export const QUERY_MODES = ['full', 'plate_only'] as const
export type QueryMode = (typeof QUERY_MODES)[number]

/** Credits charged per provider query (PlacApi tariffs). Cache hits are free. */
export const QUERY_MODE_CREDIT_COSTS: Record<QueryMode, number> = {
  full: 3,
  plate_only: 11,
}

/** Validity of SOAT and RTM documents. */
export const DOCUMENT_VALIDITIES = ['valid', 'expiring_soon', 'expired', 'not_required'] as const
export type DocumentValidity = (typeof DOCUMENT_VALIDITIES)[number]

export const DOCUMENT_VALIDITY_LABELS: Record<DocumentValidity, string> = {
  valid: 'Vigente',
  expiring_soon: 'Por vencer',
  expired: 'Vencido',
  not_required: 'No aplica',
}

export const LOOKUP_STATUSES = ['pending', 'completed', 'failed', 'refunded'] as const
export type LookupStatus = (typeof LOOKUP_STATUSES)[number]

export const LOOKUP_SOURCES = ['provider', 'cache'] as const
export type LookupSource = (typeof LOOKUP_SOURCES)[number]

export const CREDIT_LEDGER_REASONS = [
  'initial_grant',
  'purchase',
  'lookup_charge',
  'lookup_refund',
  'adjustment',
] as const
export type CreditLedgerReason = (typeof CREDIT_LEDGER_REASONS)[number]

export const VEHICLE_PROVIDERS = ['mock', 'placapi'] as const
export type VehicleProviderName = (typeof VEHICLE_PROVIDERS)[number]

export const DATA_SOURCES = ['memory', 'supabase'] as const
export type DataSource = (typeof DATA_SOURCES)[number]

/** RUNT registration statuses. */
export const REGISTRATION_STATUSES = ['active', 'cancelled', 'suspended'] as const
export type RegistrationStatus = (typeof REGISTRATION_STATUSES)[number]

export const REGISTRATION_STATUS_LABELS: Record<RegistrationStatus, string> = {
  active: 'Activa',
  cancelled: 'Cancelada',
  suspended: 'Suspendida',
}

export const TAX_STATUSES = ['pending', 'paid'] as const
export type TaxStatus = (typeof TAX_STATUSES)[number]

/** Insurance claim types reported by Fasecolda. */
export const CLAIM_TYPES = ['total_loss', 'partial_loss', 'theft'] as const
export type ClaimType = (typeof CLAIM_TYPES)[number]

export const CLAIM_TYPE_LABELS: Record<ClaimType, string> = {
  total_loss: 'Pérdida total',
  partial_loss: 'Pérdida parcial',
  theft: 'Hurto',
}

/** Hours a provider response stays fresh in vehicle_cache. */
export const CACHE_TTL_HOURS = 24

/** A SOAT or RTM expiring within this many days is flagged as "expiring soon". */
export const DOCUMENT_EXPIRING_SOON_DAYS = 30

/** Sensible defaults for the max offer calculator (COP). */
export const OFFER_DEFAULTS = {
  transferCost: 1_200_000,
  repairCosts: 0,
  targetMarginPercent: 10,
} as const

/** Max offers are rounded down to this step (COP). */
export const OFFER_ROUNDING_STEP = 100_000

export const OFFER_MAX_MARGIN_PERCENT = 50

/** Demo mode (DATA_SOURCE=memory). */
export const DEMO_USER = {
  id: '00000000-0000-4000-8000-000000000001',
  displayName: 'Compraventero Demo',
  businessName: 'Autos Demo',
} as const

export const DEMO_INITIAL_CREDITS = 50

/** Realistic Colombian test plates served by MockVehicleProvider. */
export const DEMO_PLATES = [
  {
    plate: 'KLM482',
    label: 'Mazda CX-30 2022',
    ownerDocument: '1020456789',
    expectedStatus: 'green',
  },
  {
    plate: 'JTR915',
    label: 'Chevrolet Onix Turbo 2021',
    ownerDocument: '43876512',
    expectedStatus: 'yellow',
  },
  {
    plate: 'BXZ304',
    label: 'Toyota Fortuner 2020',
    ownerDocument: '94512387',
    expectedStatus: 'red',
  },
] as const satisfies ReadonlyArray<{
  plate: string
  label: string
  ownerDocument: string
  expectedStatus: TrafficLightStatus
}>

/** Property card photo upload limits. */
export const PROPERTY_CARD_MAX_BYTES = 10 * 1024 * 1024
export const PROPERTY_CARD_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/heic',
  'image/heif',
] as const

/** Plate that makes MockVehicleProvider fail with a transient error (tests the refund flow). */
export const MOCK_TRANSIENT_ERROR_PLATE = 'ERR503'
