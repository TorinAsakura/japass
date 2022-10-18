import { QueryHandler }             from '@nestjs/cqrs'
import { IQueryHandler }            from '@nestjs/cqrs'

import { InjectMarketplaceService } from '@marketplace/domain-module'
import { MarketplaceService }       from '@marketplace/domain-module'

import { GetProductsQuery }         from '../queries'

@QueryHandler(GetProductsQuery)
export class GetProductsQueryHandler implements IQueryHandler<GetProductsQuery> {
  constructor(
    @InjectMarketplaceService()
    private readonly marketplaceService: MarketplaceService
  ) {}

  async execute(query: GetProductsQuery) {
    return this.marketplaceService.getProducts()
  }
}
