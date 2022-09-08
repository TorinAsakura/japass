import { Injectable }             from '@nestjs/common'
import { OnApplicationBootstrap } from '@nestjs/common'

import { SynchronizerService }    from '@synchronizer/domain-module'

@Injectable()
export class SchedulerService implements OnApplicationBootstrap {
  constructor(private readonly synchronizerService: SynchronizerService) {}

  async onApplicationBootstrap() {
    const synchronizeAllProducts = async () => {
      await this.synchronizerService.synchronizeProductsWithMarketplace()
      setTimeout(synchronizeAllProducts, 3000)
    }

    synchronizeAllProducts()
  }
}
