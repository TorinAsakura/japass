import { Logger }                  from '@atls/logger'
import { Injectable }              from '@nestjs/common'
import { Inject }                  from '@nestjs/common'

import { FetchResponse }           from 'node-fetch'

import { REQUEST_SERVICE_OPTIONS } from '../module'
import { IRequestServiceOptions }  from '../module'

@Injectable()
export class RequestService {
  #logger: Logger = new Logger('RequestService')

  constructor(
    @Inject(REQUEST_SERVICE_OPTIONS)
    private readonly options: IRequestServiceOptions
  ) {}

  async makeRequest(...args) {
    return new Promise<FetchResponse>((resolve) => {
      const execute = async () => {
        try {
          const response = await this.options.fetch(...args)
          const json = await response.json()
          resolve(json)
        } catch (e) {
          this.#logger.info(
            `Failed request for url ${args[0]}, retrying in ${this.options.timeoutOnFailure}ms`
          )
          setTimeout(execute, this.options.timeoutOnFailure)
        }
      }

      execute()
    })
  }
}
