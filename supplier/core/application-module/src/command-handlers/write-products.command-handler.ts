/* eslint-disable no-await-in-loop */

import { Logger }                          from '@atls/logger'
import { CommandHandler }                  from '@nestjs/cqrs'
import { ICommandHandler }                 from '@nestjs/cqrs'
import { EventBus }                        from '@nestjs/cqrs'

import { v4 as uuid }                      from 'uuid'

import { ProductsRepository }              from '@supplier/domain-module'
import { InjectProductsRepository }        from '@supplier/domain-module'
import { InjectSupplierService }           from '@supplier/domain-module'
import { SupplierService }                 from '@supplier/domain-module'
import { InjectOperationsRepository }      from '@supplier/jobs-adapter-module'
import { InjectRewriteEnforcerRepository } from '@supplier/jobs-adapter-module'
import { Operation }                       from '@supplier/jobs-adapter-module'
import { OperationsRepository }            from '@supplier/jobs-adapter-module'
import { RewriteEnforcer }                 from '@supplier/jobs-adapter-module'
import { RewriteEnforcerRepository }       from '@supplier/jobs-adapter-module'

import { WriteProductsCommand }            from '../commands'
import { WroteProductsEvent }              from '../events'

@CommandHandler(WriteProductsCommand)
export class WriteProductsCommandHandler implements ICommandHandler<WriteProductsCommand> {
  #logger: Logger = new Logger(WriteProductsCommandHandler.name)

  #rewriteEnforcerFlag: boolean = true

  constructor(
    @InjectOperationsRepository()
    private readonly operationsRepository: OperationsRepository,
    @InjectRewriteEnforcerRepository()
    private readonly rewriteEnforcerRepository: RewriteEnforcerRepository,
    @InjectProductsRepository()
    private readonly productsRepository: ProductsRepository,
    @InjectSupplierService()
    private readonly supplierService: SupplierService,
    private readonly eventBus: EventBus
  ) {}

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

  async execute() {
    const productsObservable$ = await this.supplierService.getAllProducts({
      detailed: true,
      startFrom: await this.getStartFrom(),
    })

    productsObservable$.subscribe({
      next: async (products) => {
        for (const product of products) {
          await this.productsRepository.save(product)
        }
      },
      complete: () => {
        this.#logger.info('Completed writing all products')

        this.eventBus.publish(new WroteProductsEvent())
      },
    })
  }
}
