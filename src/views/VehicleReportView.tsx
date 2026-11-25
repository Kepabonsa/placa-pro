// Author: Kevin Pabón
'use client'

// external imports
import Link from 'next/link'
import { Loader2Icon, SearchXIcon } from 'lucide-react'
import { toast } from 'sonner'
import { useCallback, useEffect, useState } from 'react'
import { useParams } from 'next/navigation'

// internal imports
import { AppHeaderComponent } from '@/components/AppHeaderComponent'
import { Button, buttonVariants } from '@/components/ui/button'
import { DateUtil } from '@/utils/DateUtil'
import { DEAL_TAG_LABELS, QUERY_MODE_CREDIT_COSTS } from '@/constants/domain'
import { DealApiService } from '@/services/DealApiService'
import type { DealInterface } from '@/interfaces/DealInterface'
import type { DealTag } from '@/constants/domain'
import { DealTagChipsComponent } from '@/components/DealTagChipsComponent'
import { ErrorUtil } from '@/utils/ErrorUtil'
import { LookupApiService } from '@/services/LookupApiService'
import { OfferCalculatorComponent } from '@/components/OfferCalculatorComponent'
import { PlateUtil } from '@/utils/PlateUtil'
import { ReportAccordionComponent } from '@/components/ReportAccordionComponent'
import { ReportSkeletonComponent } from '@/components/ReportSkeletonComponent'
import { TrafficLightHeaderComponent } from '@/components/TrafficLightHeaderComponent'
import type { UpdateOfferCalcDto } from '@/dtos/UpdateOfferCalcDto'
import type { VehicleLookupResultInterface } from '@/interfaces/VehicleLookupInterface'
import { VehicleReportUtil } from '@/utils/VehicleReportUtil'

interface LoadedReportInterface {
  requestedPlate: string
  result: VehicleLookupResultInterface | null
  error: unknown
}

/** Report + calculator for /placa/[id]. Reading params requires the segment's loading.tsx. */
export function VehicleReportView(): React.JSX.Element {
  const params = useParams<{ id: string }>()
  const requestedPlate = params.id
  const [loaded, setLoaded] = useState<LoadedReportInterface | null>(null)
  const [isLookingUp, setIsLookingUp] = useState(false)
  const [isSavingTag, setIsSavingTag] = useState(false)

  useEffect(() => {
    let isActive = true
    LookupApiService.findOne(requestedPlate)
      .then((result) => {
        if (isActive) {
          setLoaded({ requestedPlate, result, error: null })
        }
      })
      .catch((error: unknown) => {
        if (isActive) {
          setLoaded({ requestedPlate, result: null, error })
        }
      })
    return (): void => {
      isActive = false
    }
  }, [requestedPlate])

  const replaceDeal = useCallback((deal: DealInterface): void => {
    setLoaded((current) =>
      current?.result ? { ...current, result: { ...current.result, deal } } : current,
    )
  }, [])

  const handleSaveOffer = useCallback(
    async (changes: UpdateOfferCalcDto): Promise<DealInterface> => {
      const deal = await DealApiService.update(requestedPlate, changes)
      replaceDeal(deal)
      return deal
    },
    [requestedPlate, replaceDeal],
  )

  const handleTagChange = async (dealTag: DealTag | null): Promise<void> => {
    if (!dealTag) {
      return
    }
    setIsSavingTag(true)
    try {
      const deal = await DealApiService.update(requestedPlate, { dealTag })
      replaceDeal(deal)
      toast.success(`Etiqueta: ${DEAL_TAG_LABELS[deal.dealTag]}`)
    } catch (error) {
      toast.error(ErrorUtil.getMessage(error))
    } finally {
      setIsSavingTag(false)
    }
  }

  const handleLookupNow = async (): Promise<void> => {
    setIsLookingUp(true)
    try {
      const result = await LookupApiService.create({ plate: requestedPlate })
      setLoaded({ requestedPlate, result, error: null })
      toast.success(`Consulta lista: ${result.lookup.creditsCharged} créditos.`)
    } catch (error) {
      toast.error(ErrorUtil.getMessage(error))
    } finally {
      setIsLookingUp(false)
    }
  }

  if (loaded?.requestedPlate !== requestedPlate) {
    return (
      <>
        <AppHeaderComponent title="Reporte" backHref="/" />
        <ReportSkeletonComponent />
      </>
    )
  }

  const { result } = loaded
  if (!result) {
    const isNotFound = ErrorUtil.isNotFound(loaded.error)
    return (
      <>
        <AppHeaderComponent title="Reporte" backHref="/" />
        <div className="flex flex-col items-center gap-4 px-6 py-12 text-center">
          <SearchXIcon className="size-12 text-muted-foreground" aria-hidden />
          <p className="text-base font-medium">{ErrorUtil.getMessage(loaded.error)}</p>
          {isNotFound ? (
            <Button
              type="button"
              onClick={handleLookupNow}
              disabled={isLookingUp}
              className="h-14 w-full rounded-xl text-base font-semibold"
            >
              {isLookingUp ? <Loader2Icon className="size-5 animate-spin" aria-hidden /> : null}
              Consultar solo con placa · {QUERY_MODE_CREDIT_COSTS.plate_only} créditos
            </Button>
          ) : null}
          <Link
            href="/"
            className={buttonVariants({
              variant: 'outline',
              className: 'h-12 w-full rounded-xl text-base',
            })}
          >
            {isNotFound
              ? `Agregar cédula y pagar ${QUERY_MODE_CREDIT_COSTS.full} créditos`
              : 'Volver al inicio'}
          </Link>
        </div>
      </>
    )
  }

  const { report, assessment, lookup, deal } = result
  const vehicleLabel = VehicleReportUtil.getLabel(report.vehicle)
  const costNote =
    lookup.source === 'cache'
      ? 'Desde caché, sin costo'
      : `${lookup.queryMode === 'full' ? 'Con cédula' : 'Solo placa'} · ${lookup.creditsCharged} créditos`
  const sourceNote = `${costNote} · ${DateUtil.formatDateTime(lookup.createdAt)}${
    report.provider === 'mock' ? ' · Datos de prueba' : ''
  }`

  return (
    <>
      <AppHeaderComponent
        title={vehicleLabel}
        subtitle={`Placa ${PlateUtil.format(report.plate)}`}
        creditBalance={result.creditBalance}
        backHref="/"
      />
      <div className="flex flex-col gap-5 px-4 py-4">
        <TrafficLightHeaderComponent
          assessment={assessment}
          plate={report.plate}
          vehicleLabel={vehicleLabel}
          sourceNote={sourceNote}
        />
        <OfferCalculatorComponent
          key={lookup.id}
          deal={deal}
          fasecoldaValue={report.fasecolda.referenceValue}
          trafficLight={assessment.status}
          onSave={handleSaveOffer}
        />
        <section aria-labelledby="deal-tag-title" className="flex flex-col gap-2">
          <h2 id="deal-tag-title" className="text-sm font-semibold">
            Etiqueta comercial
          </h2>
          <DealTagChipsComponent
            label="Etiqueta comercial"
            value={deal.dealTag}
            onChange={handleTagChange}
            disabled={isSavingTag}
          />
        </section>
        <section aria-labelledby="details-title" className="flex flex-col gap-2">
          <h2 id="details-title" className="text-sm font-semibold">
            Detalle del reporte
          </h2>
          <ReportAccordionComponent
            report={report}
            assessment={assessment}
            referenceDate={new Date(result.evaluatedAt)}
          />
        </section>
      </div>
    </>
  )
}
