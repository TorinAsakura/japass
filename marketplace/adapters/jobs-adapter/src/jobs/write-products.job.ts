import { Logger }                   from '@atls/logger'
import { Injectable }               from '@nestjs/common'
import { OnApplicationBootstrap }   from '@nestjs/common'
import { CommandBus }               from '@nestjs/cqrs'

import { CreateProductsCommand }    from '@marketplace/application-module'
import { InjectProductsRepository } from '@marketplace/domain-module'
import { ProductsRepository }       from '@marketplace/domain-module'

import { InjectActiveJob }          from '../decorators'
import { ActiveJob }                from '../enums'

@Injectable()
export class WriteProductsJob implements OnApplicationBootstrap {
  #logger: Logger = new Logger(WriteProductsJob.name)

  constructor(
    @InjectActiveJob()
    private readonly activeJob: ActiveJob,
    @InjectProductsRepository()
    private readonly productsRepository: ProductsRepository,
    private readonly commandBus: CommandBus
  ) {}

  onApplicationBootstrap() {
    this.writeProducts()
  }

  async writeProducts() {
    if (this.activeJob === ActiveJob.WRITE_PRODUCTS) {
      this.#logger.info(`Job: ${this.activeJob}`)

      await this.productsRepository.mapAllProducts(async (products, page) => {
        await this.commandBus.execute(new CreateProductsCommand(products))
      })

      this.#logger.info('Done')
    }
  }
}
