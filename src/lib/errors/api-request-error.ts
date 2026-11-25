// Author: Kevin Pabón
/** Error thrown by the browser API services with the message returned by the API. */
export class ApiRequestError extends Error {
  constructor(
    message: string,
    readonly statusCode: number,
    readonly code: string,
  ) {
    super(message)
    this.name = 'ApiRequestError'
  }
}
