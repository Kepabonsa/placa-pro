// Author: Kevin Pabón
// internal imports
import { ApiRequestError } from '@/lib/errors/api-request-error'

/** Error helpers for the UI. */
export class ErrorUtil {
  static readonly FALLBACK_MESSAGE = 'Ocurrió un error inesperado. Intenta de nuevo.'

  /**
   * Message to show in a toast.
   * @param error - Caught value.
   * @returns The API (Spanish) message or a generic fallback.
   */
  static getMessage(error: unknown): string {
    return error instanceof Error && error.message ? error.message : ErrorUtil.FALLBACK_MESSAGE
  }

  /**
   * Tells whether an API call failed with 404.
   * @param error - Caught value.
   * @returns True for ApiRequestError with status 404.
   */
  static isNotFound(error: unknown): boolean {
    return error instanceof ApiRequestError && error.statusCode === 404
  }
}
