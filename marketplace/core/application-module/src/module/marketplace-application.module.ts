import * as eventHandlers   from '../event-handlers'
import * as commandHandlers from '../command-handlers'

import { DynamicModule }    from '@nestjs/common'
import { Module }           from '@nestjs/common'

@Module({})
export class MarketplaceApplicationModule {
  static register(): DynamicModule {
    return {
      global: true,
      module: MarketplaceApplicationModule,
      providers: [...Object.values(eventHandlers), ...Object.values(commandHandlers)],
    }
  }
}
