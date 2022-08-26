import * as services                    from '../services'

import { DynamicModule }                from '@nestjs/common'
import { Module }                       from '@nestjs/common'

import { KOMUS_ADAPTER_MODULE_OPTIONS } from './komus-adapter-module.constants'
import { KomusAdapterModuleOptions }    from './komus-adapter-module.options'

@Module({})
export class SynchronizerSharedModule {
  static register(): DynamicModule {
    return {
      global: true,
      module: SynchronizerSharedModule,
      providers: [
        {
          provide: KOMUS_ADAPTER_MODULE_OPTIONS,
          useValue: KomusAdapterModuleOptions,
        },
        ...Object.values(services),
      ],
      exports: Object.values(services),
    }
  }
}
