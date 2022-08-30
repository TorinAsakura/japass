import * as services                  from '../services'

import { DynamicModule }              from '@nestjs/common'
import { Module }                     from '@nestjs/common'

import { KOMUS_ADAPTER_CONFIG_TOKEN } from '../config'
import { KomusAdapterConfig }         from '../config'

@Module({})
export class KomusAdapterModule {
  static register(): DynamicModule {
    return {
      global: true,
      module: KomusAdapterModule,
      providers: [
        {
          provide: KOMUS_ADAPTER_CONFIG_TOKEN,
          useValue: KomusAdapterConfig,
        },
        ...Object.values(services),
      ],
      exports: Object.values(services),
    }
  }
}
