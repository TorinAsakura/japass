import fetch                    from 'node-fetch'

import { ISharedRequestConfig } from './shared-request-config.interfaces'

export const SharedRequestConfig: ISharedRequestConfig = {
  fetch,
  timeoutOnFailure: 30000,
  maxRequestTimeout: 150000,
}
