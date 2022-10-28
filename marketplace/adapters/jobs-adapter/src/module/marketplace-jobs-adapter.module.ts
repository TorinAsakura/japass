import * as jobs                               from '../jobs'

import { DynamicModule }                       from '@nestjs/common'
import { Module }                              from '@nestjs/common'

import { ACTIVE_JOB_TOKEN }                    from '../constants'
import { MarketplaceJobsAdapterModuleOptions } from './marketplace-jobs-adapter-module.interfaces'

@Module({})
export class MarketplaceJobsAdapterModule {
  static register(options: MarketplaceJobsAdapterModuleOptions): DynamicModule {
    return {
      global: true,
      module: MarketplaceJobsAdapterModule,
      providers: [
        ...Object.values(jobs),
        {
          provide: ACTIVE_JOB_TOKEN,
          useValue: options.activeJob,
        },
      ],
    }
  }
}
