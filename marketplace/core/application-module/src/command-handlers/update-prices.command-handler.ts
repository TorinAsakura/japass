import { CommandHandler }           from '@nestjs/cqrs'
import { ICommandHandler }          from '@nestjs/cqrs'

import { InjectMarketplaceService } from '@marketplace/domain-module'
import { MarketplaceService }       from '@marketplace/domain-module'

import { UpdatePricesCommand }      from '../commands'

@CommandHandler(UpdatePricesCommand)
export class UpdatePricesCommandHandler implements ICommandHandler<UpdatePricesCommand> {
  constructor(
    @InjectMarketplaceService()
    private readonly marketplaceService: MarketplaceService
  ) {}

  async execute({ products }: UpdatePricesCommand) {
    await this.marketplaceService.updatePrices({ products })
  }
}
