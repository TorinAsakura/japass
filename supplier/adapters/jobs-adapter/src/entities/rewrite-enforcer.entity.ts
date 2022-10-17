import assert from 'assert'

export class RewriteEnforcer {
  #id!: string

  #flag!: boolean

  constructor(id: string, flag: boolean) {
    this.#id = id
    this.#flag = flag
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

  static create(id: string, flag: boolean) {
    assert.ok(id, `Required field 'id'`)
    assert.ok(typeof flag === 'boolean', `Required field 'flag'`)

    return new RewriteEnforcer(id, flag)
  }

  async update(flag: boolean) {
    assert.ok(typeof flag === 'boolean', `Required field 'flag'`)

    return new RewriteEnforcer(this.id, flag)
  }
}
