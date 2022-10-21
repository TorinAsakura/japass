import { Logger }                     from '@atls/logger'
import { CommandHandler }             from '@nestjs/cqrs'
import { ICommandHandler }            from '@nestjs/cqrs'
import { EventBus }                   from '@nestjs/cqrs'

import pLimit                         from 'p-limit'
import { Observable }                 from 'rxjs'

import { Product }                    from '@marketplace/domain-module'
import { InjectMarketplaceService }   from '@marketplace/domain-module'
import { MarketplaceService }         from '@marketplace/domain-module'
import { InjectProductsRepository }   from '@marketplace/domain-module'
import { ProductsRepository }         from '@marketplace/domain-module'

import { SynchronizeProductsCommand } from '../commands'
import { SynchronizedProductsEvent }  from '../events'

@CommandHandler(SynchronizeProductsCommand)
export class SynchronizeProductsCommandHandler
  implements ICommandHandler<SynchronizeProductsCommand>
{
  #logger: Logger = new Logger(SynchronizeProductsCommandHandler.name)

  constructor(
    @InjectMarketplaceService()
    private readonly marketplaceService: MarketplaceService,
    @InjectProductsRepository()
    private readonly productsRepository: ProductsRepository,
    private readonly eventBus: EventBus
  ) {}

  async execute() {
    const productsObservable$: Observable<Array<Product>> =
      await this.marketplaceService.getProducts()

    productsObservable$.subscribe({
      next: (products) => {
        const execute = async () => {
          const limit = pLimit(1)

          const byPriceChanged = (product: Product) =>
            product!.priceWithExtraCharge() !==
            products.find((p) => p.articleNumber !== product!.articleNumber)?.price

          // @ts-ignore
          const productsFromDb: Array<Product> = await Promise.all(
            products.map((product) =>
              limit(() => this.productsRepository.findByArticleNumber(product.articleNumber)))
          ).then(
            (result) =>
              (result.filter((product) => Boolean(product)) as Array<Product>)
                .filter(byPriceChanged)
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
          )

          if (productsFromDb.length > 0) {
            await this.marketplaceService.updateStocks({ products: productsFromDb })
            await this.marketplaceService.updatePrices({ products: productsFromDb })
          }
        }

        execute()
      },
      complete: () => {
        this.#logger.info(`Done`)
        this.eventBus.publish(new SynchronizedProductsEvent())
      },
    })
  }
}
