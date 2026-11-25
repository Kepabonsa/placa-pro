// Author: Kevin Pabón
// internal imports
import { ApiHandler } from '@/lib/http/api-handler'
import { ServiceFactory } from '@/lib/services/service.factory'
import { SessionService } from '@/lib/services/session.service'

/** GET /api/profile — dealer profile and credit balance. */
export async function GET(): Promise<Response> {
  return ApiHandler.run(async () => {
    const user = await SessionService.requireUser()
    const profile = await ServiceFactory.profileService().findOne(user.id)
    return ApiHandler.json(profile)
  })
}
