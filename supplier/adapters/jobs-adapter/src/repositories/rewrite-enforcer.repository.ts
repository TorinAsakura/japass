import { Injectable }            from '@nestjs/common'
import { InjectRepository }      from '@nestjs/typeorm'

import { Repository }            from 'typeorm'

import { RewriteEnforcerEntity } from '@shared/typeorm-adapter-module'

import { RewriteEnforcer }       from '../entities'

@Injectable()
export class RewriteEnforcerRepository {
  constructor(
    @InjectRepository(RewriteEnforcerEntity)
    private readonly repository: Repository<RewriteEnforcerEntity>
  ) {}

  async save(data: RewriteEnforcer): Promise<void> {
    await this.repository.save(this.toPersistence(data))
  }

  async findOne(): Promise<RewriteEnforcer | undefined> {
    const entity = await this.repository.findOne()

    return entity ? this.toDomain(entity) : undefined
  }

  private toDomain(entity: RewriteEnforcerEntity): RewriteEnforcer {
    return RewriteEnforcer.create(entity.id, entity.flag)
  }

  private toPersistence(data: RewriteEnforcer): RewriteEnforcerEntity {
    return Object.assign(new RewriteEnforcerEntity(), data.properties)
  }
}
