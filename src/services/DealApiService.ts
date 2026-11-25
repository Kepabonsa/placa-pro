// Author: Kevin Pabón
// internal imports
import type { DealHistoryItemInterface, DealInterface } from '@/interfaces/DealInterface'
import type { FindDealsQueryDto } from '@/dtos/FindDealsQueryDto'
import { HttpClientService } from '@/services/HttpClientService'
import type { UpdateOfferCalcDto } from '@/dtos/UpdateOfferCalcDto'

/** Bridge to /api/deals. */
export class DealApiService {
  static async findAll(query: FindDealsQueryDto): Promise<DealHistoryItemInterface[]> {
    return HttpClientService.get<DealHistoryItemInterface[]>('/api/deals', query)
  }

  static async update(plate: string, dto: UpdateOfferCalcDto): Promise<DealInterface> {
    return HttpClientService.patch<DealInterface>(`/api/deals/${encodeURIComponent(plate)}`, dto)
  }
}
