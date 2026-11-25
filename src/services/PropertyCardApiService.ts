// Author: Kevin Pabón
// internal imports
import { HttpClientService } from '@/services/HttpClientService'
import type { PropertyCardExtractionInterface } from '@/interfaces/VehicleLookupInterface'

/** Bridge to /api/property-cards/extract. */
export class PropertyCardApiService {
  static async extract(image: File): Promise<PropertyCardExtractionInterface> {
    const formData = new FormData()
    formData.append('image', image)
    return HttpClientService.postForm<PropertyCardExtractionInterface>(
      '/api/property-cards/extract',
      formData,
    )
  }
}
