import { CommandHandler }           from '@nestjs/cqrs'
import { ICommandHandler }          from '@nestjs/cqrs'
import { EventBus }                 from '@nestjs/cqrs'

import { InjectMarketplaceService } from '@marketplace/domain-module'
import { MarketplaceService }       from '@marketplace/domain-module'
import { InjectProductsRepository } from '@marketplace/domain-module'
import { ProductsRepository }       from '@marketplace/domain-module'

import { WriteProductsCommand }     from '../commands'
import { WroteProductsEvent }       from '../events'

@CommandHandler(WriteProductsCommand)
export class WriteProductsCommandHandler implements ICommandHandler<WriteProductsCommand> {
  constructor(
    @InjectMarketplaceService()
    private readonly marketplaceService: MarketplaceService,
    @InjectProductsRepository()
    private readonly productsRepository: ProductsRepository,
    private readonly eventBus: EventBus
  ) {}

  async execute() {
    await this.productsRepository.mapAllProducts(async (products, page) => {
      await this.marketplaceService.createProducts({ products })
    })

    this.eventBus.publish(new WroteProductsEvent())
  }
}
