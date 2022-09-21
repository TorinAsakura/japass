import { Injectable }                from '@nestjs/common'
import { EventBus }                  from '@nestjs/cqrs'
import { InjectRepository }          from '@nestjs/typeorm'

import { Repository }                from 'typeorm'

import { RewriteEnforcer }           from '@synchronizer/domain-module'
import { RewriteEnforcerRepository } from '@synchronizer/domain-module'

import { RewriteEnforcerEntity }     from '../entities'

@Injectable()
export class RewriteEnforcerRepositoryImpl extends RewriteEnforcerRepository {
  constructor(
    @InjectRepository(RewriteEnforcerEntity)
    private readonly repository: Repository<RewriteEnforcerEntity>,
    private readonly eventBus: EventBus
  ) {
    super()
  }

  async save(aggregate: RewriteEnforcer): Promise<void> {
    await this.repository.save(await this.aggregateToEntity(aggregate))

    if (aggregate.getUncommittedEvents().length > 0) {
      this.eventBus.publishAll(aggregate.getUncommittedEvents())
    }

    aggregate.commit()
  }

  async findOne(): Promise<RewriteEnforcer | undefined> {
    const entity = await this.repository.findOne()

    return entity ? this.entityToAggregate(entity) : undefined
  }

  private entityToAggregate(entity: RewriteEnforcerEntity): RewriteEnforcer {
    return new RewriteEnforcer({
      ...entity,
    })
  }

  private async aggregateToEntity(data: RewriteEnforcer): Promise<RewriteEnforcerEntity> {
    return Object.assign(new RewriteEnforcerEntity(), data.properties)
  }
}
