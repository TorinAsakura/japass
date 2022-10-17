import * as queryHandlers from '../query-handlers'

import { DynamicModule }  from '@nestjs/common'
import { Module }         from '@nestjs/common'

@Module({})
export class SupplierApplicationModule {
  static register(): DynamicModule {
    return {
      global: true,
      module: SupplierApplicationModule,
      providers: [...Object.values(queryHandlers)],
    }
  }
}
