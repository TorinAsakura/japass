import { Logger }                     from '@atls/logger'
import { Injectable }                 from '@nestjs/common'
import { OnApplicationBootstrap }     from '@nestjs/common'
import { CommandBus }                 from '@nestjs/cqrs'

import { SynchronizeProductsCommand } from '@marketplace/application-module'
import { InjectProductsRepository }   from '@marketplace/domain-module'
import { ProductsRepository }         from '@marketplace/domain-module'

import { InjectActiveJob }            from '../decorators'
import { ActiveJob }                  from '../enums'

@Injectable()
export class SynchronizeProductsJob implements OnApplicationBootstrap {
  #logger: Logger = new Logger(SynchronizeProductsJob.name)

  constructor(
    @InjectActiveJob()
    private readonly activeJob: ActiveJob,
    @InjectProductsRepository()
    private readonly productsRepository: ProductsRepository,
    private readonly commandBus: CommandBus
  ) {}

  onApplicationBootstrap() {
    this.synchronizeProducts()
  }

  async synchronizeProducts() {
    if (this.activeJob === ActiveJob.SYNCHRONIZE_PRODUCTS) {
      await this.commandBus.execute(new SynchronizeProductsCommand())
    }
  }
}
