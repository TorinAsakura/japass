/* eslint-disable no-await-in-loop */

import { Logger }                     from '@atls/logger'
import { CommandHandler }             from '@nestjs/cqrs'
import { ICommandHandler }            from '@nestjs/cqrs'
import { EventBus }                   from '@nestjs/cqrs'

import { InjectProductsRepository }   from '@supplier/domain-module'
import { InjectSupplierService }      from '@supplier/domain-module'
import { ProductsRepository }         from '@supplier/domain-module'
import { SupplierService }            from '@supplier/domain-module'
import { ActiveJob }                  from '@supplier/jobs-adapter-module'
import { InjectActiveJob }            from '@supplier/jobs-adapter-module'

import { SynchronizeProductsCommand } from '../commands'
import { SynchronizedProductsEvent }  from '../events'

@CommandHandler(SynchronizeProductsCommand)
export class SynchronizeProductsCommandHandler
  implements ICommandHandler<SynchronizeProductsCommand>
{
  #logger: Logger = new Logger(SynchronizeProductsCommandHandler.name)

  constructor(
    @InjectActiveJob()
    private readonly activeJob: ActiveJob,
    @InjectProductsRepository()
    private readonly productsRepository: ProductsRepository,
    @InjectSupplierService()
    private readonly supplierService: SupplierService,
    private readonly eventBus: EventBus
  ) {}

  async execute() {
    if (this.activeJob === ActiveJob.SYNCHRONIZE_PRODUCTS) {
      const productsObservable$ = await this.supplierService.getAllProducts({
        detailed: false,
        startFrom: 0,
      })

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
          this.#logger.info(`Completed synchronizing all products`)

          this.eventBus.publish(new SynchronizedProductsEvent())
        },
      })
    }
  }
}
