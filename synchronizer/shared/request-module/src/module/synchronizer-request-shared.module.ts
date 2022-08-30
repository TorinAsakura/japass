import * as services                                from '../services'

import { DynamicModule }                            from '@nestjs/common'
import { Module }                                   from '@nestjs/common'

import { SYNCHRONIZER_REQUEST_SHARED_CONFIG_TOKEN } from '../config'
import { SynchronizerRequestSharedConfig }          from '../config'

@Module({})
export class SynchronizerRequestSharedModule {
  static register(): DynamicModule {
    return {
      global: true,
      module: SynchronizerRequestSharedModule,
      providers: [
        {
          provide: SYNCHRONIZER_REQUEST_SHARED_CONFIG_TOKEN,
          useValue: SynchronizerRequestSharedConfig,
        },
        ...Object.values(services),
      ],
      exports: Object.values(services),
    }
  }
}
