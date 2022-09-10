import * as services     from '../services'

import { DynamicModule } from '@nestjs/common'
import { Module }        from '@nestjs/common'

@Module({})
export class SynchronizerApplicationModule {
  static register(): DynamicModule {
    return {
      module: SynchronizerApplicationModule,
      providers: [...Object.values(services)],
    }
  }
}
