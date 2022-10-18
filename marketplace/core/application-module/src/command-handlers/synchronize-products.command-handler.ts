import { Logger }                     from '@atls/logger'
import { CommandHandler }             from '@nestjs/cqrs'
import { ICommandHandler }            from '@nestjs/cqrs'

import pLimit                         from 'p-limit'
import { Observable }                 from 'rxjs'

import { Product }                    from '@marketplace/domain-module'
import { InjectMarketplaceService }   from '@marketplace/domain-module'
import { MarketplaceService }         from '@marketplace/domain-module'
import { InjectProductsRepository }   from '@marketplace/domain-module'
import { ProductsRepository }         from '@marketplace/domain-module'

import { SynchronizeProductsCommand } from '../commands'

@CommandHandler(SynchronizeProductsCommand)
export class SynchronizeProductsCommandHandler
  implements ICommandHandler<SynchronizeProductsCommand>
{
  #logger: Logger = new Logger(SynchronizeProductsCommandHandler.name)

  constructor(
    @InjectMarketplaceService()
    private readonly marketplaceService: MarketplaceService,
    @InjectProductsRepository()
    private readonly productsRepository: ProductsRepository
  ) {}

  async execute() {
    const productsObservable$: Observable<Array<Product>> =
      await this.marketplaceService.getProducts()

    productsObservable$.subscribe({
      next: (products) => {
        const execute = async () => {
          const limit = pLimit(1)

          // @ts-ignore
          const productsFromDb: Array<Product> = await Promise.all(
            products.map((product) =>
              limit(() => this.productsRepository.findByArticleNumber(product.articleNumber)))
          ).then((result) => result.filter((position) => Boolean(position)))

          if (productsFromDb.length > 0) {
            await this.marketplaceService.updateStocks({ products: productsFromDb })
            await this.marketplaceService.updatePrices({ products: productsFromDb })
          }
        }

        execute()
      },
      complete: () => {
        this.#logger.info(`Done`)
      },
    })
  }
}
