// Author: Kevin Pabón
// internal imports
import { ApiHandler } from '@/lib/http/api-handler'
import { PlateParamDtoSchema } from '@/dtos/PlateParamDto'
import { ServiceFactory } from '@/lib/services/service.factory'
import { SessionService } from '@/lib/services/session.service'
import { UpdateOfferCalcDtoSchema } from '@/dtos/UpdateOfferCalcDto'

/** PATCH /api/deals/[plate] — updates calculator inputs and/or the commercial tag. */
export async function PATCH(
  request: Request,
  context: { params: Promise<{ plate: string }> },
): Promise<Response> {
  return ApiHandler.run(async () => {
    const user = await SessionService.requireUser()
    const { plate } = ApiHandler.parse(PlateParamDtoSchema, await context.params)
    const dto = ApiHandler.parse(UpdateOfferCalcDtoSchema, await ApiHandler.readJson(request))
    const deal = await ServiceFactory.dealService().update(user.id, plate, dto)
    return ApiHandler.json(deal)
  })
}
