import { Logger }                      from '@atls/logger'
import { Injectable }                  from '@nestjs/common'
import { Inject }                      from '@nestjs/common'

import { FetchResponse }               from 'node-fetch'

import { SHARED_REQUEST_CONFIG_TOKEN } from '../config'
import { ISharedRequestConfig }        from '../config'

@Injectable()
export class RequestService {
  #logger: Logger = new Logger('RequestService')

  constructor(
    @Inject(SHARED_REQUEST_CONFIG_TOKEN)
    private readonly config: ISharedRequestConfig
  ) {}

  async makeRequest(...args) {
    return new Promise<FetchResponse>((resolve) => {
      const execute = async () => {
        try {
          // eslint-disable-next-line no-async-promise-executor
          const response = await new Promise(async (r, reject) => {
            const timeout = setTimeout(
              () =>
                // eslint-disable-next-line
                reject(`Request timeout (${this.config.maxRequestTimeout}ms) exceeded`),
              this.config.maxRequestTimeout
            )
            try {
              const res = await this.config.fetch(...args)
              const json = await res.json()
              clearTimeout(timeout)
              r(json)
            } catch (e) {
              reject(e)
              clearTimeout(timeout)
            }
          })
          resolve(response)
        } catch (e) {
          const res = await this.config.fetch(...args)
          this.#logger.error(e)
          this.#logger.info(await res.text())
          this.#logger.info(
            `Failed request for url ${args[0]}, retrying in ${this.config.timeoutOnFailure}`
          )
          setTimeout(execute, this.config.timeoutOnFailure)
        }
      }

      execute()
    })
  }
}
