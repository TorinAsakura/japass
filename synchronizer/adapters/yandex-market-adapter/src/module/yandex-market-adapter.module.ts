import * as services                          from '../services'

import { DynamicModule }                      from '@nestjs/common'
import { Module }                             from '@nestjs/common'

import { YANDEX_MARKET_ADAPTER_CONFIG_TOKEN } from '../config'
import { YandexMarketAdapterConfig }          from '../config'

@Module({})
export class YandexMarketAdapterModule {
  static register(): DynamicModule {
    return {
      global: true,
      module: YandexMarketAdapterModule,
      providers: [
        {
          provide: YANDEX_MARKET_ADAPTER_CONFIG_TOKEN,
          useValue: YandexMarketAdapterConfig,
        },
        ...Object.values(services),
      ],
      exports: [...Object.values(services)],
    }
  }
}
