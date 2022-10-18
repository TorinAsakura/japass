import { CommandHandler }           from '@nestjs/cqrs'
import { ICommandHandler }          from '@nestjs/cqrs'
import { EventBus }                 from '@nestjs/cqrs'

import { InjectMarketplaceService } from '@marketplace/domain-module'
import { MarketplaceService }       from '@marketplace/domain-module'
import { InjectProductsRepository } from '@marketplace/domain-module'
import { ProductsRepository }       from '@marketplace/domain-module'
import { Product }                  from '@marketplace/domain-module'

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
      const processedProducts: Array<Product> = products
        .map((product) => {
          if (product.remains < 10) {
            return undefined
          }

          if (product.price < 150) {
            return Product.create(
              product.id,
              `${product.name} (${product.minForOrder()} шт.)`,
              product.price * product.minForOrder(),
              product.remains,
              product.articleNumber,
              product.code,
              product.description,
              product.brand,
              product.UOM,
              product.nds,
              product.country,
              product.imagePreview,
              product.images,
              product.width,
              product.height,
              product.depth,
              product.weight,
              product.volume,
              product.barcodes,
              product.category
            )
          }

          return product
        })
        .filter((product) => Boolean(product)) as Array<Product>

      await this.marketplaceService.createProducts({ products: processedProducts })
    })

    this.eventBus.publish(new WroteProductsEvent())
  }
}
