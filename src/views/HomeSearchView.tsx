// Author: Kevin Pabón
'use client'

// external imports
import { toast } from 'sonner'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

// internal imports
import { AppHeaderComponent } from '@/components/AppHeaderComponent'
import type { CreateLookupDto } from '@/dtos/CreateLookupDto'
import { DealApiService } from '@/services/DealApiService'
import type { DealHistoryItemInterface } from '@/interfaces/DealInterface'
import { DemoPlatesComponent } from '@/components/DemoPlatesComponent'
import { ErrorUtil } from '@/utils/ErrorUtil'
import { LookupApiService } from '@/services/LookupApiService'
import { OwnerDocumentUtil } from '@/utils/OwnerDocumentUtil'
import { PlateSearchComponent } from '@/components/PlateSearchComponent'
import { PlateUtil } from '@/utils/PlateUtil'
import { ProfileApiService } from '@/services/ProfileApiService'
import { PropertyCardApiService } from '@/services/PropertyCardApiService'
import { PropertyCardScanComponent } from '@/components/PropertyCardScanComponent'
import { RecentLookupsComponent } from '@/components/RecentLookupsComponent'

const RECENT_LIMIT = 3

/** Home: plate search, property card scan, test plates and recent history. */
export function HomeSearchView(): React.JSX.Element {
  const router = useRouter()
  const [plate, setPlate] = useState('')
  const [ownerDocument, setOwnerDocument] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isExtracting, setIsExtracting] = useState(false)
  const [creditBalance, setCreditBalance] = useState<number | null>(null)
  const [recentDeals, setRecentDeals] = useState<DealHistoryItemInterface[]>([])
  const [isLoadingRecent, setIsLoadingRecent] = useState(true)

  // Runs again every time the screen becomes visible (Cache Components keeps it mounted).
  useEffect(() => {
    let isActive = true
    Promise.all([ProfileApiService.findOne(), DealApiService.findAll({ limit: RECENT_LIMIT })])
      .then(([profile, deals]) => {
        if (isActive) {
          setCreditBalance(profile.creditBalance)
          setRecentDeals(deals)
        }
      })
      .catch((error: unknown) => {
        if (isActive) {
          toast.error(ErrorUtil.getMessage(error))
        }
      })
      .finally(() => {
        if (isActive) {
          setIsLoadingRecent(false)
        }
      })
    return (): void => {
      isActive = false
    }
  }, [])

  const runLookup = async (dto: CreateLookupDto): Promise<void> => {
    setIsSubmitting(true)
    try {
      const result = await LookupApiService.create(dto)
      setCreditBalance(result.creditBalance)
      toast.success(
        result.lookup.source === 'cache'
          ? 'Reporte desde caché (24 h): sin costo.'
          : `Consulta lista: ${result.lookup.creditsCharged} créditos.`,
      )
      setPlate('')
      setOwnerDocument('')
      router.push(`/placa/${result.lookup.plate}`)
    } catch (error) {
      toast.error(ErrorUtil.getMessage(error))
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSubmit = async (): Promise<void> => {
    await runLookup({ plate, ownerDocument })
  }

  const handleDemoSelect = async (demoPlate: string, demoDocument: string): Promise<void> => {
    setPlate(demoPlate)
    setOwnerDocument(demoDocument)
    await runLookup({ plate: demoPlate, ownerDocument: demoDocument })
  }

  const handleCardFile = async (file: File): Promise<void> => {
    setIsExtracting(true)
    try {
      const extraction = await PropertyCardApiService.extract(file)
      setPlate(extraction.plate)
      setOwnerDocument(extraction.ownerDocument)
      toast.success(
        `Tarjeta leída: ${PlateUtil.format(extraction.plate)} · CC ${OwnerDocumentUtil.mask(extraction.ownerDocument)}. Revisa y valida.`,
      )
    } catch (error) {
      toast.error(ErrorUtil.getMessage(error))
    } finally {
      setIsExtracting(false)
    }
  }

  return (
    <>
      <AppHeaderComponent
        title="PlacaPro"
        subtitle="Valida y calcula tu oferta en segundos"
        creditBalance={creditBalance}
      />
      <div className="flex flex-col gap-6 px-4 py-5">
        <PlateSearchComponent
          plate={plate}
          ownerDocument={ownerDocument}
          isSubmitting={isSubmitting}
          onPlateChange={setPlate}
          onOwnerDocumentChange={setOwnerDocument}
          onSubmit={handleSubmit}
        />
        <div className="flex items-center gap-3 text-xs text-muted-foreground" aria-hidden>
          <span className="h-px flex-1 bg-border" />o<span className="h-px flex-1 bg-border" />
        </div>
        <PropertyCardScanComponent isExtracting={isExtracting} onFileSelected={handleCardFile} />
        <DemoPlatesComponent disabled={isSubmitting} onSelect={handleDemoSelect} />
        <RecentLookupsComponent items={recentDeals} isLoading={isLoadingRecent} />
      </div>
    </>
  )
}
