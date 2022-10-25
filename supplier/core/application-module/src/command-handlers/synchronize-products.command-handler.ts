/* eslint-disable no-await-in-loop */

import { Logger }                     from '@atls/logger'
import { CommandHandler }             from '@nestjs/cqrs'
import { ICommandHandler }            from '@nestjs/cqrs'
import { EventBus }                   from '@nestjs/cqrs'

import pLimit                         from 'p-limit'

import { InjectProductsRepository }   from '@supplier/domain-module'
import { InjectSupplierService }      from '@supplier/domain-module'
import { ProductsRepository }         from '@supplier/domain-module'
import { SupplierService }            from '@supplier/domain-module'

import { SynchronizeProductsCommand } from '../commands'
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
    private readonly eventBus: EventBus
  ) {}

  async execute() {
    const commonLimit = pLimit(2)
    let completed = false

    const productsObservable$ = await this.supplierService.getAllProducts({
      detailed: false,
      startFrom: 0,
    })

    await productsObservable$.subscribe({
      next: (products) => {
        const execute = async () => {
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
              await this.productsRepository.save(retrievedProduct)
            }
          }
        }

        commonLimit(execute).then(() => {
          this.#logger.info(`Operations left: ${commonLimit.pendingCount}`)

          if (completed && commonLimit.activeCount === 0) {
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
