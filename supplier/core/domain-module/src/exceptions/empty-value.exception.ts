/* eslint-disable max-classes-per-file */
import { AssertionError } from 'assert'

export class IdEmptyValueException extends AssertionError {
  constructor(options: { message?: string | undefined } = {}) {
    super({ ...options, message: options.message || `Required field 'id'` })
  }
}

export class PriceEmptyValueException extends AssertionError {
  constructor(options: { message?: string | undefined } = {}) {
    super({ ...options, message: options.message || `Required field 'price'` })
  }
}

export class RemainsEmptyValueException extends AssertionError {
  constructor(options: { message?: string | undefined } = {}) {
    super({ ...options, message: options.message || `Required field 'remains'` })
  }
}

export class ArticleNumberEmptyValueException extends AssertionError {
  constructor(options: { message?: string | undefined } = {}) {
    super({ ...options, message: options.message || `Required field 'remains'` })
  }
}

export class NameEmptyValueException extends AssertionError {
  constructor(options: { message?: string | undefined } = {}) {
    super({ ...options, message: options.message || `Required field 'remains'` })
  }
}

export class ValueEmptyValueException extends AssertionError {
  constructor(options: { message?: string | undefined } = {}) {
    super({ ...options, message: options.message || `Required field 'value'` })
  }
}

export class FlagEmptyValueException extends AssertionError {
  constructor(options: { message?: string | undefined } = {}) {
    super({ ...options, message: options.message || `Required field 'flag'` })
  }
}
