import { Logger }                                  from '@atls/logger'
import { Injectable }                              from '@nestjs/common'
import { Inject }                                  from '@nestjs/common'
import { OnApplicationBootstrap }                  from '@nestjs/common'

import { SynchronizerService }                     from '@synchronizer/domain-module'

import { SYNCHRONIZER_APPLICATION_MODULE_OPTIONS } from '../constants'
import { Job }                                     from '../enums'
import { SynchronizerApplicationModuleOptions }    from '../module'

@Injectable()
export class SchedulerService implements OnApplicationBootstrap {
  #logger: Logger = new Logger('SchedulerService')

  constructor(
    private readonly synchronizerService: SynchronizerService,
    @Inject(SYNCHRONIZER_APPLICATION_MODULE_OPTIONS)
    private readonly options: SynchronizerApplicationModuleOptions
  ) {}

  startWriteAllProductsToMarketplace() {
    const writeAllProductsToMarketplace = async () => {
      this.#logger.info('Called writeAllProductsToMarketplace()')

      await this.synchronizerService.writeAllProductsToMarketplace()
      setTimeout(writeAllProductsToMarketplace, 60000)

      this.#logger.info('Finished writeAllProductsToMarketplace()')
    }

    writeAllProductsToMarketplace()
  }

  startSynchronizeProductsWithMarketplace() {
    const synchronizeAllProductsWithMarketplace = async () => {
      this.#logger.info('Called startSynchronizeProductsWithMarketplace()')

      await this.synchronizerService.synchronizeProductsWithMarketplace()
      setTimeout(synchronizeAllProductsWithMarketplace, 90000)

      this.#logger.info('Finished startSynchronizeProductsWithMarketplace()')
    }

    synchronizeAllProductsWithMarketplace()
  }

  startSynchronizeStocksWithMarketplace() {
    const synchronizeStocksWithMarketplace = async () => {
      this.#logger.info('Called synchronizeStocksWithMarketplace()')

      await this.synchronizerService.synchronizeStocksWithMarketplace()
      setTimeout(synchronizeStocksWithMarketplace, 10000)

      this.#logger.info('Finished synchronizeStocksWithMarketplace()')
    }

    synchronizeStocksWithMarketplace()
  }

  async onApplicationBootstrap() {
    if (this.options.job === Job.SYNCHRONIZER) {
      this.startSynchronizeProductsWithMarketplace()
    } else if (this.options.job === Job.WRITER) {
      this.startWriteAllProductsToMarketplace()
    }
  }
}
