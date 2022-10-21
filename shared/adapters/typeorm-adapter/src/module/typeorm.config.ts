import * as entities                      from '../entities'
import * as migrations                    from '../migrations'

import { TypeOrmLogger }                  from '@atls/typeorm-logger'
import { Inject }                         from '@nestjs/common'
import { Injectable }                     from '@nestjs/common'
import { TypeOrmOptionsFactory }          from '@nestjs/typeorm'
import { TypeOrmModuleOptions }           from '@nestjs/typeorm'

import { TYPEORM_ADAPTER_MODULE_OPTIONS } from './typeorm-adapter-module.constants'
import { SupplierTypeOrmOptions }         from './typeorm-adapter-module.interfaces'

@Injectable()
export class TypeOrmConfig implements TypeOrmOptionsFactory {
  constructor(
    @Inject(TYPEORM_ADAPTER_MODULE_OPTIONS)
    private readonly options: SupplierTypeOrmOptions
  ) {}

  createTypeOrmOptions(): TypeOrmModuleOptions {
    return {
      type: 'postgres',
      uuidExtension: 'pgcrypto',
      port: this.options.db?.port || 5432,
      host: this.options.db?.host || process.env.DB_HOST || 'localhost',
      database: this.options.db?.database || process.env.DB_DATABASE || 'db',
      username: this.options.db?.username || process.env.DB_USERNAME || 'postgres',
      password: this.options.db?.password || process.env.DB_PASSWORD || 'password',
      migrations: Object.values(migrations),
      entities: Object.values(entities),
      logger: new TypeOrmLogger(),
      migrationsRun: true,
    }
  }
}
