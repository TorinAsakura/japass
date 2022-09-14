import { Injectable }           from '@nestjs/common'
import { EventBus }             from '@nestjs/cqrs'
import { InjectRepository }     from '@nestjs/typeorm'

import { Repository }           from 'typeorm'

import { Operation }            from '@synchronizer/domain-module'
import { OperationsRepository } from '@synchronizer/domain-module'

import { OperationEntity }      from '../entities'

@Injectable()
export class OperationsRepositoryImpl extends OperationsRepository {
  constructor(
    @InjectRepository(OperationEntity)
    private readonly repository: Repository<OperationEntity>,
    private readonly eventBus: EventBus
  ) {
    super()
  }

  async save(aggregate: Operation): Promise<void> {
    await this.repository.save(await this.aggregateToEntity(aggregate))

    if (aggregate.getUncommittedEvents().length > 0) {
      this.eventBus.publishAll(aggregate.getUncommittedEvents())
    }

    aggregate.commit()
  }

  async findById(id: string): Promise<Operation | undefined> {
    const entity = await this.repository.findOne({ id })

    return entity ? this.entityToAggregate(entity) : undefined
  }

  async findLastCompleted(): Promise<Operation | undefined> {
    const entity = await this.repository
      .createQueryBuilder('operation')
      .orderBy('operation.completedAtTs', 'DESC')
      .getOne()

    return entity ? this.entityToAggregate(entity) : undefined
  }

  private entityToAggregate(entity: OperationEntity): Operation {
    return new Operation({
      ...entity,
    })
  }

  private async aggregateToEntity(data: Operation): Promise<OperationEntity> {
    return Object.assign(new OperationEntity(), data.properties)
  }
}
