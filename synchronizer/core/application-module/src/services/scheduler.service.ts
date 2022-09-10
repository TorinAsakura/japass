import { Logger }                 from '@atls/logger'
import { Injectable }             from '@nestjs/common'
import { OnApplicationBootstrap } from '@nestjs/common'

import { SynchronizerService }    from '@synchronizer/domain-module'

@Injectable()
export class SchedulerService implements OnApplicationBootstrap {
  #logger: Logger = new Logger('SchedulerService')

  constructor(private readonly synchronizerService: SynchronizerService) {}

  async onApplicationBootstrap() {
    const synchronizeAllProducts = async () => {
      this.#logger.info('Called synchronizeAllProducts()')

      await this.synchronizerService.synchronizeProductsWithDb()
      await this.synchronizerService.synchronizeProductsWithMarketplace()
      setTimeout(synchronizeAllProducts, 30000)

      this.#logger.info('Finished synchronizeAllProducts()')
    }

    synchronizeAllProducts()
  }
}
