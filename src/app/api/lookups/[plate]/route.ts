// Author: Kevin Pabón
// internal imports
import { ApiHandler } from '@/lib/http/api-handler'
import { PlateParamDtoSchema } from '@/dtos/PlateParamDto'
import { ServiceFactory } from '@/lib/services/service.factory'
import { SessionService } from '@/lib/services/session.service'

/** GET /api/lookups/[plate] — re-opens the latest report of a plate (free). */
export async function GET(
  _request: Request,
  context: { params: Promise<{ plate: string }> },
): Promise<Response> {
  return ApiHandler.run(async () => {
    const user = await SessionService.requireUser()
    const { plate } = ApiHandler.parse(PlateParamDtoSchema, await context.params)
    const result = await ServiceFactory.lookupService().findOne(user.id, plate)
    return ApiHandler.json(result)
  })
}
