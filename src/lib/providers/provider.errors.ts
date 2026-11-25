// Author: Kevin Pabón
/** Temporary provider failure (timeout, 429, 5xx, network). Credits must be refunded. */
export class ProviderTransientError extends Error {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options)
    this.name = 'ProviderTransientError'
  }
}

/** The provider answered but has no records for the requested plate. */
export class ProviderNotFoundError extends Error {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options)
    this.name = 'ProviderNotFoundError'
  }
}

/** Unexpected provider answer (bad request, auth failure, unknown payload). */
export class ProviderResponseError extends Error {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options)
    this.name = 'ProviderResponseError'
  }
}
