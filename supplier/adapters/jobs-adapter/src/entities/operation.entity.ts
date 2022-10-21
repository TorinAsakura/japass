import assert from 'assert'

export class Operation {
  #id!: string

  #completedAtTs!: number

  #page!: number

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

  private constructor(id: string, completedAtTs: number, page: number) {
    this.#id = id
    this.#completedAtTs = completedAtTs
    this.#page = page
  }

  static create(id: string, completedAtTs: number, page: number) {
    assert.ok(id, `Required field 'id'`)
    assert.ok(completedAtTs, `Required field 'completedAtTs'`)
    assert.ok(!Number.isNaN(page), `Required field 'page'`)

    return new Operation(id, completedAtTs, page)
  }

  update(completedAtTs: number, page: number) {
    assert.ok(completedAtTs, `Required field 'completedAtTs'`)
    assert.ok(!Number.isNaN(page), `Required field 'page'`)

    return new Operation(this.id, completedAtTs, page)
  }
}
