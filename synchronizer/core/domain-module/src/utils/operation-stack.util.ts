type Cb = () => Promise<any>

export class OperationStack<T = any> {
  #operations: Array<Promise<T> | T> = []

  get operations() {
    return this.#operations
  }

  push(operation: Cb) {
    this.#operations.push(
      new Promise((resolve) => {
        operation().then(resolve)
      })
    )
  }

  async waitForAll() {
    this.#operations = await Promise.all(this.#operations)
  }
}
