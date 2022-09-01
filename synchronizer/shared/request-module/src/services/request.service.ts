import { Logger }                                   from '@atls/logger'
import { Injectable }                               from '@nestjs/common'
import { Inject }                                   from '@nestjs/common'

import { FetchResponse }                            from 'node-fetch'

import { SYNCHRONIZER_REQUEST_SHARED_CONFIG_TOKEN } from '../config'
import { ISynchronizerRequestSharedConfig }         from '../config'

@Injectable()
export class RequestService {
  #logger: Logger = new Logger('RequestService')

  constructor(
    @Inject(SYNCHRONIZER_REQUEST_SHARED_CONFIG_TOKEN)
    private readonly options: ISynchronizerRequestSharedConfig
  ) {}

  async makeRequest(...args) {
    return new Promise<FetchResponse>((resolve) => {
      const execute = async () => {
        try {
          const response = await this.options.fetch(...args)
          const json = await response.json()
          resolve(json)
        } catch (e) {
          const response = await this.options.fetch(...args)
          this.#logger.error(e)
          this.#logger.error(await response.text())
          setTimeout(execute, this.options.timeoutOnFailure)
        }
      }

      execute()
    })
  }
}
