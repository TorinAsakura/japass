import { Logger }                   from '@atls/logger'
import { Injectable }               from '@nestjs/common'
import { CommandBus }               from '@nestjs/cqrs'
import { CronExpression }           from '@nestjs/schedule'
import { Cron }                     from '@nestjs/schedule'

import { WriteProductsCommand }     from '@marketplace/application-module'
import { InjectProductsRepository } from '@marketplace/domain-module'
import { ProductsRepository }       from '@marketplace/domain-module'

import { InjectActiveJob }          from '../decorators'
import { ActiveJob }                from '../enums'

@Injectable()
export class WriteProductsJob {
  #logger: Logger = new Logger(WriteProductsJob.name)

  constructor(
    @InjectActiveJob()
    private readonly activeJob: ActiveJob,
    @InjectProductsRepository()
    private readonly productsRepository: ProductsRepository,
    private readonly commandBus: CommandBus
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_6AM)
  async writeProducts() {
    if (this.activeJob === ActiveJob.WRITE_PRODUCTS) {
      this.#logger.info(`Job: ${this.activeJob}`)

      await this.commandBus.execute(new WriteProductsCommand())
    }
  }
}
