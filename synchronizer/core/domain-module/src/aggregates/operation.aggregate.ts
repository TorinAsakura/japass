import { AggregateRoot }    from '@nestjs/cqrs'

import { OperationCreated } from '../events'
import { OperationUpdated } from '../events'

export interface OperationOptions {
  id: string
  completedAtTs: number
  page: number
}

export class Operation extends AggregateRoot {
  #id!: string

  #completedAtTs!: number

  #page!: number

  constructor(options?: OperationOptions) {
    super()

    if (options) {
      this.#id = options.id
      this.#completedAtTs = options.completedAtTs
      this.#page = options.page
    }
  }

  get id() {
    return this.#id
  }

  get completedAtTs() {
    return this.#completedAtTs
  }

  get page() {
    return this.#page
  }

  get properties() {
    return {
      id: this.#id,
      completedAtTs: this.#completedAtTs,
      page: this.#page,
    }
  }

  async create(id: string, completedAtTs: number, page: number) {
    this.apply(new OperationCreated(id, completedAtTs, page))

    return this
  }

  onOperationCreated(event: OperationCreated) {
    this.#id = event.id
    this.#completedAtTs = event.completedAtTs
    this.#page = event.page
  }

  async update(completedAtTs: number, page: number) {
    this.apply(new OperationUpdated(completedAtTs, page))

    return this
  }

  onOperationUpdated(event: OperationUpdated) {
    this.#completedAtTs = event.completedAtTs
    this.#page = event.page
  }
}
