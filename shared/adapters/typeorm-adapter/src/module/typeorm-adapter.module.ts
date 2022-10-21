import * as entities                      from '../entities'

import { DynamicModule }                  from '@nestjs/common'
import { Module }                         from '@nestjs/common'
import { TypeOrmModule }                  from '@nestjs/typeorm'

import { TYPEORM_ADAPTER_MODULE_OPTIONS } from './typeorm-adapter-module.constants'
import { SupplierTypeOrmOptions }         from './typeorm-adapter-module.interfaces'
import { TypeOrmConfig }                  from './typeorm.config'

@Module({})
export class TypeormAdapterModule {
  static register(options: SupplierTypeOrmOptions = {}): DynamicModule {
    return {
      global: true,
      module: TypeormAdapterModule,
      imports: [
        TypeOrmModule.forFeature(Object.values(entities)),
        TypeOrmModule.forRootAsync({
          useExisting: TypeOrmConfig,
        }),
      ],
      providers: [
        TypeOrmConfig,
        {
          provide: TYPEORM_ADAPTER_MODULE_OPTIONS,
          useValue: options,
        },
      ],
      exports: [TypeOrmModule, TypeOrmConfig],
    }
  }
}
