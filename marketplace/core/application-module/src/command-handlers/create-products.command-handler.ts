import { CommandHandler }           from '@nestjs/cqrs'
import { ICommandHandler }          from '@nestjs/cqrs'

import { InjectMarketplaceService } from '@marketplace/domain-module'
import { MarketplaceService }       from '@marketplace/domain-module'

import { CreateProductsCommand }    from '../commands'

@CommandHandler(CreateProductsCommand)
export class CreateProductsCommandHandler implements ICommandHandler<CreateProductsCommand> {
  constructor(
    @InjectMarketplaceService()
    private readonly marketplaceService: MarketplaceService
  ) {}

  async execute({ products }: CreateProductsCommand) {
    await this.marketplaceService.createProducts({ products })
  }
}
