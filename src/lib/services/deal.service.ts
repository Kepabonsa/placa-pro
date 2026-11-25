// Author: Kevin Pabón
// internal imports
import type { DealHistoryItemInterface, DealInterface } from '@/interfaces/DealInterface'
import type { FindDealsQueryDto } from '@/dtos/FindDealsQueryDto'
import { NotFoundError } from '@/lib/errors/app-error'
import { OfferUtil } from '@/utils/OfferUtil'
import { PlateUtil } from '@/utils/PlateUtil'
import type { RepositoriesInterface } from '@/lib/repositories/repositories.interface'
import type { UpdateOfferCalcDto } from '@/dtos/UpdateOfferCalcDto'

/** Negotiations: history list, max offer inputs and commercial tag. */
export class DealService {
  constructor(private readonly repositories: RepositoriesInterface) {}

  /**
   * Lists the user's negotiations, most recently updated first.
   * @param userId - Authenticated user.
   * @param filters - Validated plate fragment, tag and limit.
   * @returns History rows.
   */
  async findAll(userId: string, filters: FindDealsQueryDto): Promise<DealHistoryItemInterface[]> {
    return this.repositories.deals.findAll(userId, filters)
  }

  /**
   * Updates calculator inputs and/or the tag, recalculating the max offer on the server.
   * @param userId - Authenticated user.
   * @param plate - Validated plate.
   * @param dto - Validated fields to change.
   * @returns Updated deal.
   * @throws {NotFoundError} When the plate was never validated by the user.
   */
  async update(userId: string, plate: string, dto: UpdateOfferCalcDto): Promise<DealInterface> {
    const deal = await this.repositories.deals.findOne(userId, plate)
    if (!deal) {
      throw new NotFoundError(
        `Primero consulta la placa ${PlateUtil.format(plate)} para calcular la oferta.`,
      )
    }

    const input = {
      marketValue: dto.marketValue ?? deal.marketValue,
      detectedDebts: deal.detectedDebts,
      transferCost: dto.transferCost ?? deal.transferCost,
      repairCosts: dto.repairCosts ?? deal.repairCosts,
      targetMarginPercent: dto.targetMarginPercent ?? deal.targetMarginPercent,
    }
    return this.repositories.deals.save({
      ...input,
      userId,
      plate,
      lookupId: deal.lookupId,
      maxOffer: OfferUtil.calculate(input).maxOffer,
      dealTag: dto.dealTag ?? deal.dealTag,
    })
  }
}
