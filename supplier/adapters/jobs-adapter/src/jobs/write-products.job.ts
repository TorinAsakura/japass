/* eslint-disable no-await-in-loop */

import { Logger }                          from '@atls/logger'
import { Injectable }                      from '@nestjs/common'
import { OnApplicationBootstrap }          from '@nestjs/common'
import { QueryBus }                        from '@nestjs/cqrs'

import { v4 as uuid }                      from 'uuid'

import { GetAllProductsQuery }             from '@supplier/application-module'
import { InjectProductsRepository }        from '@supplier/domain-module'
import { ProductsRepository }              from '@supplier/domain-module'

import { InjectActiveJob }                 from '../decorators'
import { InjectOperationsRepository }      from '../decorators'
import { InjectRewriteEnforcerRepository } from '../decorators'
import { Operation }                       from '../entities'
import { RewriteEnforcer }                 from '../entities'
import { ActiveJob }                       from '../enums'
import { RewriteEnforcerRepository }       from '../repositories'
import { OperationsRepository }            from '../repositories'

@Injectable()
export class WriteProductsJob implements OnApplicationBootstrap {
  #logger: Logger = new Logger(WriteProductsJob.name)

  #rewriteEnforcerFlag: boolean = false

  constructor(
    @InjectActiveJob()
    private readonly activeJob: ActiveJob,
    @InjectOperationsRepository()
    private readonly operationsRepository: OperationsRepository,
    @InjectRewriteEnforcerRepository()
    private readonly rewriteEnforcerRepository: RewriteEnforcerRepository,
    @InjectProductsRepository()
    private readonly productsRepository: ProductsRepository,
    private readonly queryBus: QueryBus
  ) {}

  onApplicationBootstrap() {
    this.writeProducts()
  }

  private async getLastOperation(): Promise<Operation> {
    let lastOperation = await this.operationsRepository.findLastCompleted()

    if (!lastOperation) {
      lastOperation = Operation.create(uuid(), Date.now(), 0)
      await this.operationsRepository.save(lastOperation)
      return lastOperation
    }

    return lastOperation
  }

  private async getStartFrom(): Promise<number> {
    let rewriteEnforcer = await this.rewriteEnforcerRepository.findOne()
    const lastOperation = await this.getLastOperation()

    if (!rewriteEnforcer) {
      rewriteEnforcer = RewriteEnforcer.create(uuid(), false)

      if (rewriteEnforcer.flag !== this.#rewriteEnforcerFlag) {
        await rewriteEnforcer.update(this.#rewriteEnforcerFlag)
        await this.rewriteEnforcerRepository.save(rewriteEnforcer)
        this.#logger.info('Writing products from scratch')

        return 0
      }

      await this.rewriteEnforcerRepository.save(rewriteEnforcer)

      return lastOperation.page
    }

    if (rewriteEnforcer.flag !== this.#rewriteEnforcerFlag) {
      await rewriteEnforcer.update(this.#rewriteEnforcerFlag)
      await this.rewriteEnforcerRepository.save(rewriteEnforcer)
      this.#logger.info('Writing products from scratch')
      return 0
    }

    return lastOperation.page
  }

  async writeProducts() {
    if (this.activeJob === ActiveJob.WRITE_PRODUCTS) {
      this.#logger.info(`Job: ${this.activeJob}`)

      const productsObservable$ = await this.queryBus.execute(
        new GetAllProductsQuery(true, await this.getStartFrom())
      )

      productsObservable$.subscribe({
        next: async (products) => {
          for (const product of products) {
            product.update(product.priceWithExtraCharge(), product.remains)

            await this.productsRepository.save(product)
          }
        },
        complete: () => {
          this.#logger.info('Completed writing all products')
        },
      })
    }
  }
}
