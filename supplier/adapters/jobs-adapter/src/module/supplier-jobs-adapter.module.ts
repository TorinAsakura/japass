import * as jobs                             from '../jobs'

import { DynamicModule }                     from '@nestjs/common'
import { Module }                            from '@nestjs/common'

import { ACTIVE_JOB_TOKEN }                  from '../constants'
import { REWRITE_ENFORCER_REPOSITORY_TOKEN } from '../constants'
import { OPERATIONS_REPOSITORY_TOKEN }       from '../constants'
import { OperationsRepository }              from '../repositories'
import { RewriteEnforcerRepository }         from '../repositories'
import { SupplierJobsAdapterModuleOptions }  from './supplier-jobs-adapter-module.interfaces'

@Module({})
export class SupplierJobsAdapterModule {
  static register(options: SupplierJobsAdapterModuleOptions): DynamicModule {
    return {
      global: true,
      module: SupplierJobsAdapterModule,
      providers: [
        ...Object.values(jobs),
        {
          provide: ACTIVE_JOB_TOKEN,
          useValue: options.activeJob,
        },
        {
          provide: REWRITE_ENFORCER_REPOSITORY_TOKEN,
          useClass: RewriteEnforcerRepository,
        },
        {
          provide: OPERATIONS_REPOSITORY_TOKEN,
          useClass: OperationsRepository,
        },
      ],
    }
  }
}
