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

  startSynchronizeAllProductsWithDb() {
    const synchronizeAllProductsWithDb = async () => {
      this.#logger.info('Called synchronizeAllProductsWithDb()')

      await this.synchronizerService.synchronizeProductsWithDb()
      setTimeout(synchronizeAllProductsWithDb, 30000)

      this.#logger.info('Finished synchronizeAllProductsWithDb()')
    }

    synchronizeAllProductsWithDb()
  }

  startSynchronizeAllProductsWithMarketplace() {
    const synchronizeAllProductsWithMarketplace = async () => {
      this.#logger.info('Called synchronizeAllProductsWithMarketplace()')

      await this.synchronizerService.synchronizeProductsWithMarketplace()
      setTimeout(synchronizeAllProductsWithMarketplace, 90000)

      this.#logger.info('Finished synchronizeAllProductsWithMarketplace()')
    }

    synchronizeAllProductsWithMarketplace()
  }

  async onApplicationBootstrap() {
    if (this.options.job === Job.WRITER) {
      this.startSynchronizeAllProductsWithMarketplace()
    } else if (this.options.job === Job.SYNCHRONIZER) {
      this.startSynchronizeAllProductsWithDb()
    }
  }
}
