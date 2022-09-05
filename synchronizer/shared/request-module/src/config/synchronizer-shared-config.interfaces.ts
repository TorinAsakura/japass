export interface ISynchronizerRequestSharedConfig {
  fetch: (...args) => Promise<any>
  timeoutOnFailure: number
  maxRequestTimeout: number
}
