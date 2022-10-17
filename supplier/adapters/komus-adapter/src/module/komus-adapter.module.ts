import { DynamicModule }              from '@nestjs/common'
import { Module }                     from '@nestjs/common'

import { SUPPLIER_SERVICE_TOKEN }     from '@supplier/domain-module'

import { KOMUS_ADAPTER_CONFIG_TOKEN } from '../config'
import { KomusAdapterConfig }         from '../config'
import { KomusSupplierService }       from '../services'

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
        {
          provide: SUPPLIER_SERVICE_TOKEN,
          useClass: KomusSupplierService,
        },
      ],
      exports: [
        {
          provide: SUPPLIER_SERVICE_TOKEN,
          useClass: KomusSupplierService,
        },
      ],
    }
  }
}
