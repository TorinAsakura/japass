import * as services                   from '../services'

import { DynamicModule }               from '@nestjs/common'
import { Module }                      from '@nestjs/common'

import { SHARED_REQUEST_CONFIG_TOKEN } from '../config'
import { SharedRequestConfig }         from '../config'

@Module({})
export class SharedRequestModule {
  static register(): DynamicModule {
    return {
      global: true,
      module: SharedRequestModule,
      providers: [
        {
          provide: SHARED_REQUEST_CONFIG_TOKEN,
          useValue: SharedRequestConfig,
        },
        ...Object.values(services),
      ],
      exports: Object.values(services),
    }
  }
}
