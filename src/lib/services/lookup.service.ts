// Author: Kevin Pabón
// internal imports
import { CACHE_TTL_HOURS, QUERY_MODE_CREDIT_COSTS } from '@/constants/domain'
import type { CreateLookupDto } from '@/dtos/CreateLookupDto'
import { DateUtil } from '@/utils/DateUtil'
import type { DealInterface } from '@/interfaces/DealInterface'
import type { LookupJobInterface } from '@/interfaces/LookupJobInterface'
import { NotFoundError, ProviderUnavailableError } from '@/lib/errors/app-error'
import { OfferUtil } from '@/utils/OfferUtil'
import { PlateUtil } from '@/utils/PlateUtil'
import { ProviderNotFoundError, ProviderTransientError } from '@/lib/providers/provider.errors'
import type { QueryMode } from '@/constants/domain'
import type { RepositoriesInterface } from '@/lib/repositories/repositories.interface'
import type { TrafficLightAssessmentInterface } from '@/interfaces/TrafficLightAssessmentInterface'
import { TrafficLightService } from '@/lib/services/traffic-light.service'
import type { VehicleLookupResultInterface } from '@/interfaces/VehicleLookupInterface'
import type { VehicleProviderInterface } from '@/lib/providers/vehicle-provider.interface'
import type { VehicleReportInterface } from '@/interfaces/VehicleReportInterface'
import { VehicleReportUtil } from '@/utils/VehicleReportUtil'

/** Orchestrates a plate validation: cache, credits, provider, traffic light and deal. */
export class LookupService {
  constructor(
    private readonly provider: VehicleProviderInterface,
    private readonly repositories: RepositoriesInterface,
    private readonly clock: () => Date = () => new Date(),
  ) {}

  /**
   * Validates a plate. A fresh cache entry (24 h) is free; otherwise the provider is queried and
   * the mode cost is charged (full = plate + document, plate_only = plate). Any provider failure
   * refunds the credits.
   * @param userId - Authenticated user.
   * @param dto - Validated plate and optional owner document.
   * @returns Report, traffic light, deal and remaining credits.
   * @throws {InsufficientCreditsError} When the balance does not cover the query.
   * @throws {NotFoundError} When the provider has no records for the plate (credits refunded).
   * @throws {ProviderUnavailableError} When the provider fails or times out (credits refunded).
   */
  async create(userId: string, dto: CreateLookupDto): Promise<VehicleLookupResultInterface> {
    const now = this.clock()
    const queryMode: QueryMode = dto.ownerDocument ? 'full' : 'plate_only'
    const cachedEntry = await this.repositories.vehicleCache.findFresh(dto.plate, now)

    const pendingLookup = await this.repositories.lookups.createWithCredits({
      userId,
      plate: dto.plate,
      ownerDocument: dto.ownerDocument ?? null,
      queryMode,
      credits: cachedEntry ? 0 : QUERY_MODE_CREDIT_COSTS[queryMode],
    })

    const report = cachedEntry?.report ?? (await this.fetchFromProvider(pendingLookup, now))
    const assessment = TrafficLightService.evaluate(report, now)
    const lookup = await this.repositories.lookups.complete(pendingLookup.id, {
      report,
      source: cachedEntry ? 'cache' : 'provider',
      trafficLight: assessment.status,
      vehicleLabel: VehicleReportUtil.getLabel(report.vehicle),
    })
    const deal = await this.syncDeal(userId, lookup, report)
    return this.buildResult(userId, lookup, report, assessment, deal)
  }

  /**
   * Re-opens the latest completed lookup of a plate without charging credits.
   * @param userId - Authenticated user.
   * @param plate - Validated plate.
   * @returns Report with the traffic light recalculated for today.
   * @throws {NotFoundError} When the user never validated the plate.
   */
  async findOne(userId: string, plate: string): Promise<VehicleLookupResultInterface> {
    const lookup = await this.repositories.lookups.findLatestCompleted(userId, plate)
    if (!lookup?.report) {
      throw new NotFoundError(`Aún no has consultado la placa ${PlateUtil.format(plate)}.`)
    }
    const deal =
      (await this.repositories.deals.findOne(userId, plate)) ??
      (await this.syncDeal(userId, lookup, lookup.report))
    const assessment = TrafficLightService.evaluate(lookup.report, this.clock())
    return this.buildResult(userId, lookup, lookup.report, assessment, deal)
  }

  private async fetchFromProvider(
    lookup: LookupJobInterface,
    now: Date,
  ): Promise<VehicleReportInterface> {
    let report: VehicleReportInterface
    try {
      report = await this.provider.lookup({
        plate: lookup.plate,
        mode: lookup.queryMode,
        ownerDocument: lookup.ownerDocument,
      })
    } catch (error) {
      const reason = error instanceof Error ? error.message : 'Unknown provider error'
      await this.repositories.lookups.refundCredits(lookup.id, reason)
      throw LookupService.toAppError(error, lookup)
    }

    await this.repositories.vehicleCache.upsert({
      plate: lookup.plate,
      provider: report.provider,
      report,
      fetchedAt: now.toISOString(),
      expiresAt: DateUtil.addHours(now, CACHE_TTL_HOURS).toISOString(),
    })
    return report
  }

  /** Creates the deal with default inputs, or refreshes the detected debts of an existing one. */
  private async syncDeal(
    userId: string,
    lookup: LookupJobInterface,
    report: VehicleReportInterface,
  ): Promise<DealInterface> {
    const existing = await this.repositories.deals.findOne(userId, lookup.plate)
    const input = existing
      ? {
          marketValue: existing.marketValue,
          detectedDebts: VehicleReportUtil.getDetectedDebts(report),
          transferCost: existing.transferCost,
          repairCosts: existing.repairCosts,
          targetMarginPercent: existing.targetMarginPercent,
        }
      : OfferUtil.buildDefaultInput(report)

    return this.repositories.deals.save({
      ...input,
      userId,
      plate: lookup.plate,
      lookupId: lookup.id,
      maxOffer: OfferUtil.calculate(input).maxOffer,
      dealTag: existing?.dealTag ?? 'new',
    })
  }

  private async buildResult(
    userId: string,
    lookup: LookupJobInterface,
    report: VehicleReportInterface,
    assessment: TrafficLightAssessmentInterface,
    deal: DealInterface,
  ): Promise<VehicleLookupResultInterface> {
    const profile = await this.repositories.profiles.findOne(userId)
    return {
      lookup: {
        id: lookup.id,
        plate: lookup.plate,
        queryMode: lookup.queryMode,
        source: lookup.source,
        creditsCharged: lookup.creditsCharged,
        createdAt: lookup.createdAt,
      },
      report,
      assessment,
      deal,
      creditBalance: profile?.creditBalance ?? 0,
    }
  }

  private static toAppError(error: unknown, lookup: LookupJobInterface): Error {
    const plate = PlateUtil.format(lookup.plate)
    const refundNote =
      lookup.creditsCharged > 0 ? ` Te devolvimos los ${lookup.creditsCharged} créditos.` : ''

    if (error instanceof ProviderNotFoundError) {
      return new NotFoundError(`No encontramos registros para la placa ${plate}.${refundNote}`)
    }
    if (error instanceof ProviderTransientError) {
      return new ProviderUnavailableError(
        `El proveedor no respondió a tiempo.${refundNote} Intenta de nuevo en unos segundos.`,
      )
    }
    console.error('[LookupService] unexpected provider error', error)
    return new ProviderUnavailableError(
      `No pudimos consultar la placa ${plate} en este momento.${refundNote}`,
    )
  }
}
