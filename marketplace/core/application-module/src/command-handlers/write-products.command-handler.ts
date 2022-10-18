import { Logger }                   from '@atls/logger'
import { CommandHandler }           from '@nestjs/cqrs'
import { ICommandHandler }          from '@nestjs/cqrs'

import { InjectMarketplaceService } from '@marketplace/domain-module'
import { MarketplaceService }       from '@marketplace/domain-module'
import { InjectProductsRepository } from '@marketplace/domain-module'
import { ProductsRepository }       from '@marketplace/domain-module'

import { WriteProductsCommand }     from '../commands'

@CommandHandler(WriteProductsCommand)
export class WriteProductsCommandHandler implements ICommandHandler<WriteProductsCommand> {
  #logger: Logger = new Logger(WriteProductsCommandHandler.name)

  constructor(
    @InjectMarketplaceService()
    private readonly marketplaceService: MarketplaceService,
    @InjectProductsRepository()
    private readonly productsRepository: ProductsRepository
  ) {}

  async execute() {
    await this.productsRepository.mapAllProducts(async (products, page) => {
      await this.marketplaceService.createProducts({ products })
    })

    this.#logger.info('Done')
  }
}
