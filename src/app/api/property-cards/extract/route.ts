// Author: Kevin Pabón
// internal imports
import { ApiHandler } from '@/lib/http/api-handler'
import { ExtractPropertyCardDtoSchema } from '@/dtos/ExtractPropertyCardDto'
import { ServiceFactory } from '@/lib/services/service.factory'
import { SessionService } from '@/lib/services/session.service'

/** POST /api/property-cards/extract — reads plate + owner document from a photo (simulated OCR). */
export async function POST(request: Request): Promise<Response> {
  return ApiHandler.run(async () => {
    await SessionService.requireUser()
    const dto = ApiHandler.parse(ExtractPropertyCardDtoSchema, await ApiHandler.readForm(request))
    const extraction = await ServiceFactory.propertyCardService().extract(dto)
    return ApiHandler.json(extraction)
  })
}
