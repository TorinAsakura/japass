import { Logger }                 from '@atls/logger'
import { Injectable }             from '@nestjs/common'
import { OnApplicationBootstrap } from '@nestjs/common'

import { SynchronizerService }    from '@synchronizer/domain-module'

@Injectable()
export class SchedulerService implements OnApplicationBootstrap {
  #logger: Logger = new Logger('SchedulerService')

  constructor(private readonly synchronizerService: SynchronizerService) {}

  async onApplicationBootstrap() {
    const synchronizeAllProductsWithDb = async () => {
      this.#logger.info('Called synchronizeAllProductsWithDb()')

      await this.synchronizerService.synchronizeProductsWithDb()
      setTimeout(synchronizeAllProductsWithDb, 30000)

      this.#logger.info('Finished synchronizeAllProductsWithDb()')
    }

    const synchronizeAllProductsWithMarketplace = async () => {
      this.#logger.info('Called synchronizeAllProductsWithMarketplace()')

      await this.synchronizerService.synchronizeProductsWithMarketplace()
      setTimeout(synchronizeAllProductsWithMarketplace, 90000)

      this.#logger.info('Finished synchronizeAllProductsWithMarketplace()')
    }

    synchronizeAllProductsWithDb()
    setTimeout(synchronizeAllProductsWithMarketplace, 90000)
  }
}
