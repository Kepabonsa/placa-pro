// Author: Kevin Pabón
// internal imports
import { ApiHandler } from '@/lib/http/api-handler'
import { CreateLookupDtoSchema } from '@/dtos/CreateLookupDto'
import { ServiceFactory } from '@/lib/services/service.factory'
import { SessionService } from '@/lib/services/session.service'

/** POST /api/lookups — validates a plate (charges credits unless the cache is fresh). */
export async function POST(request: Request): Promise<Response> {
  return ApiHandler.run(async () => {
    const user = await SessionService.requireUser()
    const dto = ApiHandler.parse(CreateLookupDtoSchema, await ApiHandler.readJson(request))
    const result = await ServiceFactory.lookupService().create(user.id, dto)
    return ApiHandler.json(result, 201)
  })
}
