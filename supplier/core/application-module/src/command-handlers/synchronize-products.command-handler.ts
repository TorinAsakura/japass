/* eslint-disable no-await-in-loop */

import { Logger }                     from '@atls/logger'
import { CommandHandler }             from '@nestjs/cqrs'
import { ICommandHandler }            from '@nestjs/cqrs'
import { EventBus }                   from '@nestjs/cqrs'

import pLimit                         from 'p-limit'
import { LimitFunction }              from 'p-limit'

import { Product }                    from '@supplier/domain-module'
import { InjectProductsRepository }   from '@supplier/domain-module'
import { InjectSupplierService }      from '@supplier/domain-module'
import { ProductsRepository }         from '@supplier/domain-module'
import { SupplierService }            from '@supplier/domain-module'

import { SynchronizeProductsCommand } from '../commands'
import { InjectCommonLimit }          from '../decorators'
import { SynchronizedProductsEvent }  from '../events'

@CommandHandler(SynchronizeProductsCommand)
export class SynchronizeProductsCommandHandler
  implements ICommandHandler<SynchronizeProductsCommand>
{
  #logger: Logger = new Logger(SynchronizeProductsCommandHandler.name)

  constructor(
    @InjectProductsRepository()
    private readonly productsRepository: ProductsRepository,
    @InjectSupplierService()
    private readonly supplierService: SupplierService,
    @InjectCommonLimit()
    private readonly commonLimit: LimitFunction,
    private readonly eventBus: EventBus
  ) {}

  async execute() {
    let completed = false

    const productsObservable$ = await this.supplierService.getAllProducts({
      detailed: false,
      startFrom: 0,
    })

    await productsObservable$.subscribe({
      next: (products) => {
        const execute = async () => {
          for (const product of products) {
            const retrievedProducts = await this.productsRepository.findByArticleNumber(
              product.articleNumber
            )

            if (retrievedProducts.length === 0) {
              return
            }

            this.#logger.info(`Synchronizing product ${product.articleNumber} with db`)

            let dbProduct: Product

            if (retrievedProducts.length > 1) {
              this.#logger.info(
                `Fixing collision for product with articleNumber ${product.articleNumber}`
              )

              dbProduct = retrievedProducts.shift()!

              const removeLimit = pLimit(1)

              await Promise.all(
                retrievedProducts.map((retrievedProduct) =>
                  removeLimit(() => this.productsRepository.remove(retrievedProduct.id)))
              )
            } else [dbProduct] = retrievedProducts

            this.#logger.info(`Updating product ${product.articleNumber}`)
            dbProduct.update(product.price, product.remains, new Date())
            await this.productsRepository.save(dbProduct)
          }
        }

        this.commonLimit(execute).then(() => {
          this.#logger.info(`Operations left: ${this.commonLimit.pendingCount}`)

          if (completed && this.commonLimit.activeCount === 0) {
            this.#logger.info('No active operations')
            this.eventBus.publish(new SynchronizedProductsEvent())
          }
        })
      },
      complete: () => {
        this.#logger.info(`Fetched all products`)
        completed = true
      },
    })
  }
}
