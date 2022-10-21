import { Logger }                 from '@atls/logger'
import { Injectable }             from '@nestjs/common'
import { OnApplicationBootstrap } from '@nestjs/common'
import { CommandBus }             from '@nestjs/cqrs'

import { WriteProductsCommand }   from '@supplier/application-module'

import { InjectActiveJob }        from '../decorators'
import { ActiveJob }              from '../enums'

@Injectable()
export class WriteProductsJob implements OnApplicationBootstrap {
  #logger: Logger = new Logger(WriteProductsJob.name)

  #rewriteEnforcerFlag: boolean = false

  constructor(
    @InjectActiveJob()
    private readonly activeJob: ActiveJob,
    private readonly commandBus: CommandBus
  ) {}

  onApplicationBootstrap() {
    this.writeProducts()
  }

  async writeProducts() {
    if (this.activeJob === ActiveJob.WRITE_PRODUCTS) {
      this.#logger.info(`Job: ${this.activeJob}`)

      await this.commandBus.execute(new WriteProductsCommand())
    }
  }
}
