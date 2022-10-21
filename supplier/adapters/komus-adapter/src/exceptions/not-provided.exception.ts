import { AssertionError } from 'assert'

export class TokenNotProvidedException extends AssertionError {
  constructor(options: { message?: string | undefined } = {}) {
    super({ ...options, message: options.message || `Authorization token was not provided` })
  }
}
