/* eslint-disable no-await-in-loop */

import { Logger }                            from '@atls/logger'
import { Injectable }                        from '@nestjs/common'
import { OnApplicationBootstrap }            from '@nestjs/common'
import { QueryBus }                          from '@nestjs/cqrs'

import { GetAllProductsQuery }               from '@supplier/application-module'
import { InjectProductsRepository }          from '@supplier/domain-module'
import { ProductsRepository }                from '@supplier/domain-module'

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
    private readonly queryBus: QueryBus
  ) {}

  onApplicationBootstrap() {
    this.synchronizeProducts()
  }

  async synchronizeProducts() {
    if (this.activeJob === ActiveJob.SYNCHRONIZE_PRODUCTS) {
      const productsObservable$ = await this.queryBus.execute(new GetAllProductsQuery(false, 0))

      await productsObservable$.subscribe({
        next: async (products) => {
          for (const product of products) {
            const retrievedProduct = await this.productsRepository.findByArticleNumber(
              product.articleNumber
            )

            if (!retrievedProduct) {
              return
            }

            this.#logger.info(`Synchronizing product ${product.articleNumber} with db`)

            if (product.country) {
              this.#logger.info(`Updating product ${product.articleNumber}`)
              retrievedProduct.update(
                retrievedProduct.priceWithExtraCharge(),
                retrievedProduct.remains
              )
              await this.productsRepository.save(retrievedProduct)
            }
          }
        },
        complete: () => {
          this.#logger.info(
            `Completed synchronizing all products, scheduling next job in ${SYNCHRONIZE_PRODUCTS_JOB_INTERVAL}ms`
          )
          setTimeout(this.synchronizeProducts, SYNCHRONIZE_PRODUCTS_JOB_INTERVAL)
        },
      })
    }
  }
}
