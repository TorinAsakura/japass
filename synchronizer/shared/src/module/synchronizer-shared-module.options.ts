import fetch from 'node-fetch'

export interface IRequestServiceOptions {
  fetch: (...args) => Promise<any>
  timeoutOnFailure: number
}

export const RequestServiceOptions: IRequestServiceOptions = {
  fetch,
  timeoutOnFailure: 10000,
}
