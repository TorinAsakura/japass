import { Logger }                 from '@atls/logger'
import { Injectable }             from '@nestjs/common'
import { OnApplicationBootstrap } from '@nestjs/common'
import { CommandBus }             from '@nestjs/cqrs'

import { RenewProductsCommand }   from '@supplier/application-module'

import { InjectActiveJob }        from '../decorators'
import { ActiveJob }              from '../enums'

@Injectable()
export class ProductsRenewerJob implements OnApplicationBootstrap {
  #logger: Logger = new Logger(ProductsRenewerJob.name)

  constructor(
    @InjectActiveJob()
    private readonly activeJob: ActiveJob,
    private readonly commandBus: CommandBus
  ) {}

  onApplicationBootstrap() {
    this.renewProducts()
  }

  async renewProducts() {
    if (this.activeJob === ActiveJob.RENEW_PRODUCTS) {
      this.#logger.info('Started renewing all products')

      await this.commandBus.execute(new RenewProductsCommand())
    }
  }
}
