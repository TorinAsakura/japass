import { CommandHandler }           from '@nestjs/cqrs'
import { ICommandHandler }          from '@nestjs/cqrs'

import { InjectMarketplaceService } from '@marketplace/domain-module'
import { MarketplaceService }       from '@marketplace/domain-module'

import { UpdateStocksCommand }      from '../commands'

@CommandHandler(UpdateStocksCommand)
export class UpdateStocksCommandHandler implements ICommandHandler<UpdateStocksCommand> {
  constructor(
    @InjectMarketplaceService()
    private readonly marketplaceService: MarketplaceService
  ) {}

  async execute({ products }: UpdateStocksCommand) {
    await this.marketplaceService.updateStocks({ products })
  }
}
