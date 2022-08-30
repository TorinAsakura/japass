import fetch                                from 'node-fetch'

import { ISynchronizerRequestSharedConfig } from './synchronizer-shared-config.interfaces'

export const SynchronizerRequestSharedConfig: ISynchronizerRequestSharedConfig = {
  fetch,
  timeoutOnFailure: 10000,
}
