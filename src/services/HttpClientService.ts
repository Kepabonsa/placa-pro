// Author: Kevin Pabón
// internal imports
import type { ApiErrorResponseInterface } from '@/interfaces/VehicleLookupInterface'
import { ApiRequestError } from '@/lib/errors/api-request-error'

/** JSON bridge to the /api routes. Throws ApiRequestError with the Spanish API message. */
export class HttpClientService {
  private static readonly FALLBACK_ERROR = {
    code: 'UNKNOWN_ERROR',
    message: 'Ocurrió un error inesperado. Intenta de nuevo.',
  }

  static async get<TResponse>(
    path: string,
    query: Record<string, string | number | undefined> = {},
  ): Promise<TResponse> {
    const searchParams = new URLSearchParams()
    for (const [key, value] of Object.entries(query)) {
      if (value !== undefined && value !== '') {
        searchParams.set(key, String(value))
      }
    }
    const queryString = searchParams.toString()
    return HttpClientService.request<TResponse>(queryString ? `${path}?${queryString}` : path, {
      method: 'GET',
    })
  }

  static async post<TResponse>(path: string, body: unknown): Promise<TResponse> {
    return HttpClientService.request<TResponse>(path, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
  }

  static async patch<TResponse>(path: string, body: unknown): Promise<TResponse> {
    return HttpClientService.request<TResponse>(path, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
  }

  static async postForm<TResponse>(path: string, formData: FormData): Promise<TResponse> {
    return HttpClientService.request<TResponse>(path, { method: 'POST', body: formData })
  }

  private static async request<TResponse>(path: string, init: RequestInit): Promise<TResponse> {
    let response: Response
    try {
      response = await fetch(path, {
        ...init,
        cache: 'no-store',
        headers: { Accept: 'application/json', ...init.headers },
      })
    } catch {
      throw new ApiRequestError(
        'Sin conexión. Revisa tu internet e intenta de nuevo.',
        0,
        'NETWORK_ERROR',
      )
    }

    const payload: unknown = await response.json().catch(() => null)
    if (!response.ok) {
      const apiError = HttpClientService.readError(payload)
      throw new ApiRequestError(apiError.message, response.status, apiError.code)
    }
    return payload as TResponse
  }

  private static readError(payload: unknown): { code: string; message: string } {
    if (typeof payload === 'object' && payload !== null && 'error' in payload) {
      const { error } = payload as ApiErrorResponseInterface
      if (typeof error?.message === 'string' && typeof error.code === 'string') {
        return error
      }
    }
    return HttpClientService.FALLBACK_ERROR
  }
}
