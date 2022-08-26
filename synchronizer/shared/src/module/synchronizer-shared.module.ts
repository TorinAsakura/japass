import * as services               from '../services'

import { DynamicModule }           from '@nestjs/common'
import { Module }                  from '@nestjs/common'

import { REQUEST_SERVICE_OPTIONS } from './synchronizer-shared-module.constants'
import { RequestServiceOptions }   from './synchronizer-shared-module.options'

@Module({})
export class SynchronizerSharedModule {
  static register(): DynamicModule {
    return {
      global: true,
      module: SynchronizerSharedModule,
      providers: [
        {
          provide: REQUEST_SERVICE_OPTIONS,
          useValue: RequestServiceOptions,
        },
        ...Object.values(services),
      ],
      exports: Object.values(services),
    }
  }
}
