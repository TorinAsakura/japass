export class Timer {
  #startTimestamp: number = 0

  #endTimestamp: number = 0

  start() {
    this.#startTimestamp = Date.now()
  }

  stop() {
    this.#endTimestamp = Date.now()
  }

  get count() {
    return this.#endTimestamp - this.#startTimestamp
  }
}
