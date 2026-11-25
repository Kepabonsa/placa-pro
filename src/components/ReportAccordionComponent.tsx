// Author: Kevin Pabón
'use client'

// internal imports
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import {
  CLAIM_TYPE_LABELS,
  DOCUMENT_VALIDITY_LABELS,
  REGISTRATION_STATUS_LABELS,
  REPORT_SECTION_LABELS,
  REPORT_SECTIONS,
} from '@/constants/domain'
import { CurrencyUtil } from '@/utils/CurrencyUtil'
import { DateUtil } from '@/utils/DateUtil'
import { DetailRowComponent } from '@/components/DetailRowComponent'
import type { ReportSection } from '@/constants/domain'
import type { TrafficLightAssessmentInterface } from '@/interfaces/TrafficLightAssessmentInterface'
import { TrafficLightDotComponent } from '@/components/TrafficLightDotComponent'
import { TrafficLightUtil } from '@/utils/TrafficLightUtil'
import type { VehicleReportInterface } from '@/interfaces/VehicleReportInterface'
import { VehicleReportUtil } from '@/utils/VehicleReportUtil'

interface ReportAccordionComponentPropsInterface {
  report: VehicleReportInterface
  assessment: TrafficLightAssessmentInterface
  referenceDate: Date
}

/** Report details grouped in four sections. Sections with alerts start open. */
export function ReportAccordionComponent({
  report,
  assessment,
  referenceDate,
}: ReportAccordionComponentPropsInterface): React.JSX.Element {
  const openSections = REPORT_SECTIONS.filter(
    (section) => TrafficLightUtil.getSectionStatus(assessment.alerts, section) !== 'green',
  )
  const soatValidity = VehicleReportUtil.getDocumentValidity(
    report.documents.soat.expiresAt,
    referenceDate,
  )
  const rtmValidity = VehicleReportUtil.getDocumentValidity(
    report.documents.technicalInspection.expiresAt,
    referenceDate,
    report.documents.technicalInspection.required,
  )
  const detectedDebts = VehicleReportUtil.getDetectedDebts(report)

  const summaries: Record<ReportSection, string> = {
    legal:
      report.legal.liens.length > 0
        ? `Prenda activa · ${report.legal.liens[0]?.creditor ?? ''}`
        : `Matrícula ${REGISTRATION_STATUS_LABELS[report.legal.registrationStatus].toLowerCase()} · sin prendas`,
    debts: detectedDebts > 0 ? `${CurrencyUtil.format(detectedDebts)} en deudas` : 'Sin deudas',
    documents: `SOAT ${DOCUMENT_VALIDITY_LABELS[soatValidity].toLowerCase()} · RTM ${DOCUMENT_VALIDITY_LABELS[rtmValidity].toLowerCase()}`,
    fasecolda: `${CurrencyUtil.format(report.fasecolda.referenceValue)} · ${
      report.fasecolda.claims.length > 0
        ? `${report.fasecolda.claims.length} siniestro(s)`
        : 'sin siniestros'
    }`,
  }

  return (
    <Accordion multiple defaultValue={openSections} className="rounded-2xl border bg-card px-4">
      {REPORT_SECTIONS.map((section) => (
        <AccordionItem key={section} value={section}>
          <AccordionTrigger className="min-h-14 items-center py-3 hover:no-underline">
            <span className="flex min-w-0 items-center gap-3">
              <TrafficLightDotComponent
                status={TrafficLightUtil.getSectionStatus(assessment.alerts, section)}
              />
              <span className="flex min-w-0 flex-col">
                <span className="text-sm font-semibold">{REPORT_SECTION_LABELS[section]}</span>
                <span className="truncate text-xs font-normal text-muted-foreground">
                  {summaries[section]}
                </span>
              </span>
            </span>
          </AccordionTrigger>
          <AccordionContent>
            <dl className="divide-y text-sm">
              {section === 'legal' ? <LegalSection report={report} /> : null}
              {section === 'debts' ? <DebtsSection report={report} /> : null}
              {section === 'documents' ? (
                <DocumentsSection report={report} referenceDate={referenceDate} />
              ) : null}
              {section === 'fasecolda' ? <FasecoldaSection report={report} /> : null}
            </dl>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  )
}

function LegalSection({ report }: { report: VehicleReportInterface }): React.JSX.Element {
  const { legal, vehicle } = report
  return (
    <>
      <DetailRowComponent
        label="Matrícula"
        value={REGISTRATION_STATUS_LABELS[legal.registrationStatus]}
        emphasis={legal.registrationStatus !== 'active'}
      />
      <DetailRowComponent
        label="Prendas"
        emphasis={legal.liens.length > 0}
        value={
          legal.liens.length > 0
            ? legal.liens
                .map((lien) => `${lien.creditor} (${DateUtil.formatDate(lien.registeredAt)})`)
                .join(' · ')
            : 'Ninguna'
        }
      />
      <DetailRowComponent
        label="Limitaciones"
        value={legal.legalLimitations.length > 0 ? legal.legalLimitations.join(' · ') : 'Ninguna'}
        emphasis={legal.legalLimitations.length > 0}
      />
      <DetailRowComponent
        label="Reporte de hurto"
        value={legal.hasTheftReport ? 'Sí' : 'No'}
        emphasis={legal.hasTheftReport}
      />
      <DetailRowComponent label="Propietarios" value={legal.ownerCount} />
      <DetailRowComponent label="Organismo de tránsito" value={vehicle.transitAuthority} />
      <DetailRowComponent label="Matriculado" value={DateUtil.formatDate(vehicle.registeredAt)} />
      <DetailRowComponent label="Versión" value={vehicle.version} />
      <DetailRowComponent label="Color" value={vehicle.color} />
      <DetailRowComponent
        label="Clase · servicio"
        value={`${vehicle.bodyType} · ${vehicle.serviceType}`}
      />
      <DetailRowComponent
        label="Motor"
        value={`${vehicle.engineDisplacementCc} cc · ${vehicle.fuelType}`}
      />
    </>
  )
}

function DebtsSection({ report }: { report: VehicleReportInterface }): React.JSX.Element {
  const { debts } = report
  return (
    <>
      {debts.fines.length === 0 ? (
        <DetailRowComponent label="Comparendos SIMIT" value="Ninguno" />
      ) : (
        debts.fines.map((fine) => (
          <DetailRowComponent
            key={`${fine.code}-${fine.issuedAt}`}
            label={`${fine.code} · ${fine.city} · ${DateUtil.formatDate(fine.issuedAt)}`}
            value={
              <span className="flex flex-col items-end">
                <span className="font-semibold">{CurrencyUtil.format(fine.amount)}</span>
                <span className="text-xs text-muted-foreground">{fine.infraction}</span>
              </span>
            }
          />
        ))
      )}
      {debts.taxes.map((tax) => (
        <DetailRowComponent
          key={`${tax.department}-${tax.year}`}
          label={`Impuesto ${tax.department} ${tax.year}`}
          value={
            tax.status === 'pending'
              ? `Pendiente · ${CurrencyUtil.format(tax.amount)}`
              : `Pagado · ${CurrencyUtil.format(tax.amount)}`
          }
          emphasis={tax.status === 'pending'}
        />
      ))}
      <DetailRowComponent
        label="Total deudas detectadas"
        value={CurrencyUtil.format(VehicleReportUtil.getDetectedDebts(report))}
        emphasis
      />
    </>
  )
}

function DocumentsSection({
  report,
  referenceDate,
}: {
  report: VehicleReportInterface
  referenceDate: Date
}): React.JSX.Element {
  const { soat, technicalInspection } = report.documents
  const describeExpiration = (expiresAt: string | null): string => {
    if (!expiresAt) {
      return 'Sin registro'
    }
    const daysLeft = DateUtil.daysUntil(expiresAt, referenceDate)
    const relative = daysLeft < 0 ? `hace ${Math.abs(daysLeft)} días` : `en ${daysLeft} días`
    return `${DateUtil.formatDate(expiresAt)} (${relative})`
  }

  return (
    <>
      <DetailRowComponent
        label="SOAT"
        value={
          DOCUMENT_VALIDITY_LABELS[
            VehicleReportUtil.getDocumentValidity(soat.expiresAt, referenceDate)
          ]
        }
        emphasis
      />
      <DetailRowComponent label="Vence" value={describeExpiration(soat.expiresAt)} />
      <DetailRowComponent label="Aseguradora" value={soat.insurer ?? '—'} />
      <DetailRowComponent
        label="Revisión técnico-mecánica"
        value={
          DOCUMENT_VALIDITY_LABELS[
            VehicleReportUtil.getDocumentValidity(
              technicalInspection.expiresAt,
              referenceDate,
              technicalInspection.required,
            )
          ]
        }
        emphasis
      />
      {technicalInspection.required ? (
        <>
          <DetailRowComponent
            label="Vence"
            value={describeExpiration(technicalInspection.expiresAt)}
          />
          <DetailRowComponent label="CDA" value={technicalInspection.inspectionCenter ?? '—'} />
        </>
      ) : (
        <DetailRowComponent label="Motivo" value="Vehículo nuevo: aún no la requiere" />
      )}
    </>
  )
}

function FasecoldaSection({ report }: { report: VehicleReportInterface }): React.JSX.Element {
  const { fasecolda } = report
  return (
    <>
      <DetailRowComponent
        label="Valor de referencia"
        value={CurrencyUtil.format(fasecolda.referenceValue)}
        emphasis
      />
      <DetailRowComponent label="Código Fasecolda" value={fasecolda.code} />
      {fasecolda.claims.length === 0 ? (
        <DetailRowComponent label="Siniestros" value="Ninguno reportado" />
      ) : (
        fasecolda.claims.map((claim) => (
          <DetailRowComponent
            key={`${claim.type}-${claim.occurredAt}`}
            label={`${CLAIM_TYPE_LABELS[claim.type]} · ${DateUtil.formatDate(claim.occurredAt)}`}
            value={claim.description}
            emphasis={claim.type !== 'partial_loss'}
          />
        ))
      )}
    </>
  )
}
