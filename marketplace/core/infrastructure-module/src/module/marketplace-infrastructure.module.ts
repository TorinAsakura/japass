import { DynamicModule }             from '@nestjs/common'
import { Module }                    from '@nestjs/common'

import { PRODUCTS_REPOSITORY_TOKEN } from '@marketplace/domain-module'

import { ProductsRepositoryImpl }    from '../repositories'

@Module({})
export class MarketplaceInfrastructureModule {
  static register(): DynamicModule {
    return {
      global: true,
      module: MarketplaceInfrastructureModule,
      providers: [
        {
          provide: PRODUCTS_REPOSITORY_TOKEN,
          useClass: ProductsRepositoryImpl,
        },
      ],
      exports: [
        {
          provide: PRODUCTS_REPOSITORY_TOKEN,
          useClass: ProductsRepositoryImpl,
        },
      ],
    }
  }
}
