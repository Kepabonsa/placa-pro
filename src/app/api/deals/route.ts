// Author: Kevin Pabón
// external imports
import type { NextRequest } from 'next/server'

// internal imports
import { ApiHandler } from '@/lib/http/api-handler'
import { FindDealsQueryDtoSchema } from '@/dtos/FindDealsQueryDto'
import { ServiceFactory } from '@/lib/services/service.factory'
import { SessionService } from '@/lib/services/session.service'

/** GET /api/deals?plate=&dealTag=&limit= — negotiation history. */
export async function GET(request: NextRequest): Promise<Response> {
  return ApiHandler.run(async () => {
    const user = await SessionService.requireUser()
    const filters = ApiHandler.parse(
      FindDealsQueryDtoSchema,
      Object.fromEntries(request.nextUrl.searchParams),
    )
    const deals = await ServiceFactory.dealService().findAll(user.id, filters)
    return ApiHandler.json(deals)
  })
}
