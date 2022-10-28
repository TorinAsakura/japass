import { Logger }                   from '@atls/logger'
import { CommandHandler }           from '@nestjs/cqrs'
import { ICommandHandler }          from '@nestjs/cqrs'

import pLimit                       from 'p-limit'

import { ProductsRepository }       from '@supplier/domain-module'
import { InjectProductsRepository } from '@supplier/domain-module'

import { RenewProductsCommand }     from '../commands'

@CommandHandler(RenewProductsCommand)
export class RenewProductsCommandHandler implements ICommandHandler<RenewProductsCommand> {
  #logger: Logger = new Logger(RenewProductsCommand.name)

  constructor(
    @InjectProductsRepository()
    private readonly productsRepository: ProductsRepository
  ) {}

  async execute(command: RenewProductsCommand) {
    const limit = pLimit(1)

    await this.productsRepository.mapAllProducts(async (products) => {
      await Promise.all(
        products.map((product) => {
          product.update(product.price, product.remains, new Date())
          return limit(() => this.productsRepository.save(product))
        })
      )

      this.#logger.info(`Renewed ${products.length} products`)
    })

    this.#logger.info('Completed renewing products')
  }
}
