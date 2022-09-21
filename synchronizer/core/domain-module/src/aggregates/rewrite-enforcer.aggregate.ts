import { AggregateRoot }           from '@nestjs/cqrs'

import assert                      from 'assert'

import { RewriteEnforcerCreated }  from '../events'
import { RewriteEnforcerUpdated }  from '../events'
import { IdEmptyValueException }   from '../exceptions'
import { FlagEmptyValueException } from '../exceptions'

export interface RewriteEnforcerOptions {
  id: string
  flag: boolean
}

export class RewriteEnforcer extends AggregateRoot {
  #id!: string

  #flag!: boolean

  constructor(options?: RewriteEnforcerOptions) {
    super()

    if (options) {
      this.#id = options.id
      this.#flag = options.flag
    }
  }

  get id() {
    return this.#id
  }

  get flag() {
    return this.#flag
  }

  get properties() {
    return {
      id: this.#id,
      flag: this.#flag,
    }
  }

  async create(id: string, flag: boolean) {
    assert.ok(id, new IdEmptyValueException())
    assert.ok(typeof flag === 'boolean', new FlagEmptyValueException())

    this.apply(new RewriteEnforcerCreated(id, flag))

    return this
  }

  onRewriteEnforcerCreated(event: RewriteEnforcerCreated) {
    this.#id = event.id
    this.#flag = event.flag
  }

  async update(flag: boolean) {
    assert.ok(typeof flag === 'boolean', new FlagEmptyValueException())

    this.apply(new RewriteEnforcerUpdated(flag))

    return this
  }

  onRewriteEnforcerUpdated(event: RewriteEnforcerUpdated) {
    this.#flag = event.flag
  }
}
