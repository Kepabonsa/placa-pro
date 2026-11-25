// Author: Kevin Pabón
// external imports
import { unstable_rethrow } from 'next/navigation'
import type { z } from 'zod'

// internal imports
import type { ApiErrorResponseInterface } from '@/interfaces/VehicleLookupInterface'
import { AppError, BadRequestError } from '@/lib/errors/app-error'
import { ValidationUtil } from '@/utils/ValidationUtil'

/** Thin HTTP adapter shared by every Route Handler: validation, JSON and error mapping. */
export class ApiHandler {
  /**
   * Runs a handler and converts thrown errors into JSON error responses.
   * @param handler - Route logic.
   * @returns The handler response or an error response.
   */
  static async run(handler: () => Promise<Response>): Promise<Response> {
    try {
      return await handler()
    } catch (error) {
      // Let Next.js internal control-flow errors (e.g. connection() during prerender) propagate.
      unstable_rethrow(error)
      return ApiHandler.toErrorResponse(error)
    }
  }

  /**
   * Builds a JSON response.
   * @param body - Response body.
   * @param status - HTTP status (200 by default).
   * @returns JSON response.
   */
  static json<TBody>(body: TBody, status: number = 200): Response {
    return Response.json(body, { status })
  }

  /**
   * Validates an input with a DTO schema.
   * @param schema - Zod schema.
   * @param input - Raw input.
   * @returns Parsed DTO.
   * @throws {BadRequestError} With the Spanish message of the first issue.
   */
  static parse<TOutput>(schema: z.ZodType<TOutput>, input: unknown): TOutput {
    const result = schema.safeParse(input)
    if (!result.success) {
      throw new BadRequestError(ValidationUtil.formatZodError(result.error))
    }
    return result.data
  }

  /**
   * Reads a JSON body.
   * @param request - Incoming request.
   * @returns Parsed body.
   * @throws {BadRequestError} When the body is not valid JSON.
   */
  static async readJson(request: Request): Promise<unknown> {
    try {
      return await request.json()
    } catch {
      throw new BadRequestError('El cuerpo de la petición debe ser JSON válido.')
    }
  }

  /**
   * Reads a multipart body as a plain object (so .strict() rejects unknown fields).
   * @param request - Incoming request.
   * @returns Form fields.
   * @throws {BadRequestError} When the body is not multipart/form-data.
   */
  static async readForm(request: Request): Promise<Record<string, FormDataEntryValue>> {
    try {
      return Object.fromEntries(await request.formData())
    } catch {
      throw new BadRequestError('Envía la imagen como multipart/form-data.')
    }
  }

  private static toErrorResponse(error: unknown): Response {
    if (error instanceof AppError) {
      return ApiHandler.json<ApiErrorResponseInterface>(
        { error: { code: error.code, message: error.message } },
        error.statusCode,
      )
    }
    console.error('[api] unexpected error', error)
    return ApiHandler.json<ApiErrorResponseInterface>(
      {
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Ocurrió un error inesperado. Intenta de nuevo.',
        },
      },
      500,
    )
  }
}
