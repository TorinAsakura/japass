import * as entities                                  from '../entities'

import { DynamicModule }                              from '@nestjs/common'
import { Module }                                     from '@nestjs/common'
import { TypeOrmModule }                              from '@nestjs/typeorm'

import { PRODUCTS_REPOSITORY_TOKEN }                  from '@synchronizer/domain-module'
import { OPERATIONS_REPOSITORY_TOKEN }                from '@synchronizer/domain-module'
import { REWRITE_ENFORCER_REPOSITORY_TOKEN }          from '@synchronizer/domain-module'

import { ProductsRepositoryImpl }                     from '../repositories'
import { OperationsRepositoryImpl }                   from '../repositories'
import { RewriteEnforcerRepositoryImpl }              from '../repositories'
import { SYNCHRONIZER_INFRASTRUCTURE_MODULE_OPTIONS } from './infrastructure-module.constants'
import { SynchronizerTypeOrmOptions }                 from './infrastructure-module.interfaces'
import { TypeOrmConfig }                              from './typeorm.config'

@Module({})
export class InfrastructureModule {
  static register(options: SynchronizerTypeOrmOptions = {}): DynamicModule {
    return {
      global: true,
      module: InfrastructureModule,
      imports: [
        TypeOrmModule.forFeature(Object.values(entities)),
        TypeOrmModule.forRootAsync({
          useExisting: TypeOrmConfig,
        }),
      ],
      providers: [
        TypeOrmConfig,
        {
          provide: SYNCHRONIZER_INFRASTRUCTURE_MODULE_OPTIONS,
          useValue: options,
        },
        {
          provide: PRODUCTS_REPOSITORY_TOKEN,
          useClass: ProductsRepositoryImpl,
        },
        {
          provide: OPERATIONS_REPOSITORY_TOKEN,
          useClass: OperationsRepositoryImpl,
        },
        {
          provide: REWRITE_ENFORCER_REPOSITORY_TOKEN,
          useClass: RewriteEnforcerRepositoryImpl,
        },
      ],
      exports: [
        TypeOrmModule,
        TypeOrmConfig,
        {
          provide: PRODUCTS_REPOSITORY_TOKEN,
          useClass: ProductsRepositoryImpl,
        },
        {
          provide: OPERATIONS_REPOSITORY_TOKEN,
          useClass: OperationsRepositoryImpl,
        },
        {
          provide: REWRITE_ENFORCER_REPOSITORY_TOKEN,
          useClass: RewriteEnforcerRepositoryImpl,
        },
      ],
    }
  }
}
