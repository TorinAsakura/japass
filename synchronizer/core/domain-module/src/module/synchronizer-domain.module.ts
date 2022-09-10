import * as services     from '../services'

import { DynamicModule } from '@nestjs/common'
import { Module }        from '@nestjs/common'

@Module({})
export class SynchronizerDomainModule {
  static register(): DynamicModule {
    return {
      global: true,
      module: SynchronizerDomainModule,
      providers: Object.values(services),
      exports: Object.values(services),
    }
  }
}
