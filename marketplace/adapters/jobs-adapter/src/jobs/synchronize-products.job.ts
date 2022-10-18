import { Logger }                            from '@atls/logger'
import { Injectable }                        from '@nestjs/common'
import { OnApplicationBootstrap }            from '@nestjs/common'
import { QueryBus }                          from '@nestjs/cqrs'
import { CommandBus }                        from '@nestjs/cqrs'

import pLimit                                from 'p-limit'
import { Observable }                        from 'rxjs'

import { GetProductsQuery }                  from '@marketplace/application-module'
import { UpdateStocksCommand }               from '@marketplace/application-module'
import { UpdatePricesCommand }               from '@marketplace/application-module'
import { Product }                           from '@marketplace/domain-module'
import { InjectProductsRepository }          from '@marketplace/domain-module'
import { ProductsRepository }                from '@marketplace/domain-module'

import { SYNCHRONIZE_PRODUCTS_JOB_INTERVAL } from '../constants'
import { InjectActiveJob }                   from '../decorators'
import { ActiveJob }                         from '../enums'

@Injectable()
export class SynchronizeProductsJob implements OnApplicationBootstrap {
  #logger: Logger = new Logger(SynchronizeProductsJob.name)

  constructor(
    @InjectActiveJob()
    private readonly activeJob: ActiveJob,
    @InjectProductsRepository()
    private readonly productsRepository: ProductsRepository,
    private readonly queryBus: QueryBus,
    private readonly commandBus: CommandBus
  ) {}

  onApplicationBootstrap() {
    this.synchronizeProducts()
  }

  async synchronizeProducts() {
    if (this.activeJob === ActiveJob.SYNCHRONIZE_PRODUCTS) {
      const productsObservable$: Observable<Array<Product>> = await this.queryBus.execute(
        new GetProductsQuery()
      )

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
              await this.commandBus.execute(new UpdateStocksCommand(productsFromDb))
              await this.commandBus.execute(new UpdatePricesCommand(productsFromDb))
            }
          }

          execute()
        },
        complete: () => {
          this.#logger.info(`Done, scheduling next job in ${SYNCHRONIZE_PRODUCTS_JOB_INTERVAL}`)
          setTimeout(this.synchronizeProducts, SYNCHRONIZE_PRODUCTS_JOB_INTERVAL)
        },
      })
    }
  }
}
