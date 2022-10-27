import * as commandHandlers   from '../command-handlers'
import * as eventHandlers     from '../event-handlers'

import { DynamicModule }      from '@nestjs/common'
import { Module }             from '@nestjs/common'

import { COMMON_LIMIT_TOKEN } from '../constants'
import { commonLimit }        from '../utils'

@Module({})
export class SupplierApplicationModule {
  static register(): DynamicModule {
    return {
      global: true,
      module: SupplierApplicationModule,
      providers: [
        ...Object.values(commandHandlers),
        ...Object.values(eventHandlers),
        {
          provide: COMMON_LIMIT_TOKEN,
          useValue: commonLimit,
        },
      ],
      exports: [
        {
          provide: COMMON_LIMIT_TOKEN,
          useValue: commonLimit,
        },
      ],
    }
  }
}
