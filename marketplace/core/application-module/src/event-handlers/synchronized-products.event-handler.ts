import { Logger }                            from '@atls/logger'
import { EventsHandler }                     from '@nestjs/cqrs'
import { CommandBus }                        from '@nestjs/cqrs'
import { IEventHandler }                     from '@nestjs/cqrs'

import { SYNCHRONIZE_PRODUCTS_JOB_INTERVAL } from '@marketplace/jobs-adapter-module'

import { SynchronizeProductsCommand }        from '../commands'
import { SynchronizedProductsEvent }         from '../events'

@EventsHandler(SynchronizedProductsEvent)
export class SynchronizedProductsHandler implements IEventHandler<SynchronizedProductsEvent> {
  #logger: Logger = new Logger(SynchronizedProductsEvent.name)

  constructor(private readonly commandBus: CommandBus) {}

  handle(event: SynchronizedProductsEvent) {
    this.#logger.info(
      `Scheduling ${SynchronizeProductsCommand.name} in ${SYNCHRONIZE_PRODUCTS_JOB_INTERVAL}`
    )
    setTimeout(
      () => this.commandBus.execute(new SynchronizeProductsCommand()),
      SYNCHRONIZE_PRODUCTS_JOB_INTERVAL
    )
  }
}
