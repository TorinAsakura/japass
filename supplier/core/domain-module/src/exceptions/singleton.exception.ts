import { AssertionError } from 'assert'

export class AlreadyInProgressSingletonException extends AssertionError {
  constructor(options: { message?: string | undefined } = {}) {
    super({ ...options, message: options.message || `Already in progress` })
  }
}
