/* eslint-disable max-classes-per-file */
import { AssertionError } from 'assert'

export class TokenNotProvidedException extends AssertionError {
  constructor(options: { message?: string | undefined } = {}) {
    super({ ...options, message: options.message || `Authorization token was not provided` })
  }
}

export class ClientIdNotProvidedException extends AssertionError {
  constructor(options: { message?: string | undefined } = {}) {
    super({ ...options, message: options.message || `Client id was not provided` })
  }
}

export class CampaignIdNotProvidedException extends AssertionError {
  constructor(options: { message?: string | undefined } = {}) {
    super({ ...options, message: options.message || `Campaign id was not provided` })
  }
}
