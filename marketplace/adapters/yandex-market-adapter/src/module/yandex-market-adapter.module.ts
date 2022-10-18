import { DynamicModule }                      from '@nestjs/common'
import { Module }                             from '@nestjs/common'

import { MARKETPLACE_SERVICE_TOKEN }          from '@marketplace/domain-module'

import { YANDEX_MARKET_ADAPTER_CONFIG_TOKEN } from '../config'
import { YandexMarketAdapterConfig }          from '../config'
import { YandexMarketMarketplaceService }     from '../services'

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
        {
          provide: MARKETPLACE_SERVICE_TOKEN,
          useClass: YandexMarketMarketplaceService,
        },
      ],
      exports: [
        {
          provide: MARKETPLACE_SERVICE_TOKEN,
          useClass: YandexMarketMarketplaceService,
        },
      ],
    }
  }
}
