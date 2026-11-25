// Author: Kevin Pabón
/** Business error with an HTTP status and a Spanish message safe to show to the user. */
export class AppError extends Error {
  constructor(
    message: string,
    readonly statusCode: number,
    readonly code: string,
  ) {
    super(message)
    this.name = 'AppError'
  }
}

export class BadRequestError extends AppError {
  constructor(message: string) {
    super(message, 400, 'BAD_REQUEST')
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = 'Inicia sesión para continuar.') {
    super(message, 401, 'UNAUTHORIZED')
  }
}

export class InsufficientCreditsError extends AppError {
  constructor(message: string) {
    super(message, 402, 'INSUFFICIENT_CREDITS')
  }
}

export class NotFoundError extends AppError {
  constructor(message: string) {
    super(message, 404, 'NOT_FOUND')
  }
}

export class ProviderUnavailableError extends AppError {
  constructor(message: string) {
    super(message, 503, 'PROVIDER_UNAVAILABLE')
  }
}

export class ConfigurationError extends AppError {
  constructor(message: string) {
    super(message, 500, 'CONFIGURATION_ERROR')
  }
}
