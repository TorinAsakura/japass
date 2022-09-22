import * as services                               from '../services'

import { DynamicModule }                           from '@nestjs/common'
import { Module }                                  from '@nestjs/common'

import { SYNCHRONIZER_APPLICATION_MODULE_OPTIONS } from '../constants'
import { SynchronizerApplicationModuleOptions }    from './synchronizer-application-module.interfaces'

@Module({})
export class SynchronizerApplicationModule {
  static register(options: SynchronizerApplicationModuleOptions): DynamicModule {
    return {
      module: SynchronizerApplicationModule,
      providers: [
        ...Object.values(services),
        {
          provide: SYNCHRONIZER_APPLICATION_MODULE_OPTIONS,
          useValue: options,
        },
      ],
    }
  }
}
