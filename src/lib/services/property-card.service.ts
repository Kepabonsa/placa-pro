// Author: Kevin Pabón
// internal imports
import { AsyncUtil } from '@/utils/AsyncUtil'
import { DEMO_PLATES } from '@/constants/domain'
import type { ExtractPropertyCardDto } from '@/dtos/ExtractPropertyCardDto'
import type { PropertyCardExtractionInterface } from '@/interfaces/VehicleLookupInterface'

/** Reads plate + owner document from a tarjeta de propiedad photo. */
export class PropertyCardService {
  private static readonly SIMULATED_CONFIDENCE = 0.94

  constructor(private readonly latencyMs: number) {}

  /**
   * Simulates OCR (Iteration 3 replaces it with a real OCR provider). The demo vehicle is picked
   * deterministically from the file size, so the same photo always returns the same data.
   * @param dto - Validated image upload.
   * @returns Extracted plate and owner document.
   */
  async extract(dto: ExtractPropertyCardDto): Promise<PropertyCardExtractionInterface> {
    await AsyncUtil.wait(this.latencyMs)
    const demoVehicle = DEMO_PLATES[dto.image.size % DEMO_PLATES.length] ?? DEMO_PLATES[0]
    return {
      plate: demoVehicle.plate,
      ownerDocument: demoVehicle.ownerDocument,
      confidence: PropertyCardService.SIMULATED_CONFIDENCE,
    }
  }
}
