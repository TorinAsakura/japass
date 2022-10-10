import fetch                                from 'node-fetch'

import { ISynchronizerRequestSharedConfig } from './synchronizer-shared-config.interfaces'

export const SynchronizerRequestSharedConfig: ISynchronizerRequestSharedConfig = {
  fetch,
  timeoutOnFailure: 30000,
  maxRequestTimeout: 150000,
}
