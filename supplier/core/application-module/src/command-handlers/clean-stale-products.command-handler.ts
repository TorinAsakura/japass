import { Logger }                    from '@atls/logger'
import { CommandHandler }            from '@nestjs/cqrs'
import { ICommandHandler }           from '@nestjs/cqrs'

import pLimit                        from 'p-limit'

import { ProductsRepository }        from '@supplier/domain-module'
import { InjectProductsRepository }  from '@supplier/domain-module'

import { CleanStaleProductsCommand } from '../commands'

@CommandHandler(CleanStaleProductsCommand)
export class CleanStaleProductsCommandHandler
  implements ICommandHandler<CleanStaleProductsCommand>
{
  #logger: Logger = new Logger(CleanStaleProductsCommandHandler.name)

  constructor(
    @InjectProductsRepository()
    private readonly productsRepository: ProductsRepository
  ) {}

  async execute(command: CleanStaleProductsCommand) {
    const stale = await this.productsRepository.findStale()

    this.#logger.info(`Found ${stale.length} stale products`)

    const limit = pLimit(1)

    await Promise.all(
      stale.map((product) => limit(() => this.productsRepository.remove(product.id)))
    )
  }
}
