export interface ISharedRequestConfig {
  fetch: (...args) => Promise<any>
  timeoutOnFailure: number
  maxRequestTimeout: number
}
