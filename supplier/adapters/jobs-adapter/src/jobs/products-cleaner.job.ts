import { Logger }                    from '@atls/logger'
import { Injectable }                from '@nestjs/common'
import { CommandBus }                from '@nestjs/cqrs'
import { Cron }                      from '@nestjs/schedule'
import { CronExpression }            from '@nestjs/schedule'

import { CleanStaleProductsCommand } from '@supplier/application-module'

import { InjectActiveJob }           from '../decorators'
import { ActiveJob }                 from '../enums'

@Injectable()
export class ProductsCleanerJob {
  #logger: Logger = new Logger(ProductsCleanerJob.name)

  constructor(
    @InjectActiveJob()
    private readonly activeJob: ActiveJob,
    private readonly commandBus: CommandBus
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_6AM)
  async cleanProducts() {
    if (this.activeJob === ActiveJob.SYNCHRONIZE_PRODUCTS) {
      this.#logger.info('Started cleaning stale products')

      await this.commandBus.execute(new CleanStaleProductsCommand())
    }
  }
}
