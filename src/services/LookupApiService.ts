// Author: Kevin Pabón
// internal imports
import type { CreateLookupDto } from '@/dtos/CreateLookupDto'
import { HttpClientService } from '@/services/HttpClientService'
import type { VehicleLookupResultInterface } from '@/interfaces/VehicleLookupInterface'

/** Bridge to /api/lookups. */
export class LookupApiService {
  static async create(dto: CreateLookupDto): Promise<VehicleLookupResultInterface> {
    return HttpClientService.post<VehicleLookupResultInterface>('/api/lookups', dto)
  }

  static async findOne(plate: string): Promise<VehicleLookupResultInterface> {
    return HttpClientService.get<VehicleLookupResultInterface>(
      `/api/lookups/${encodeURIComponent(plate)}`,
    )
  }
}
