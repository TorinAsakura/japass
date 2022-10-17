import { Injectable }       from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'

import { Repository }       from 'typeorm'

import { OperationEntity }  from '@shared/typeorm-adapter-module'

import { Operation }        from '../entities'

@Injectable()
export class OperationsRepository {
  constructor(
    @InjectRepository(OperationEntity)
    private readonly repository: Repository<OperationEntity>
  ) {}

  async save(data: Operation): Promise<void> {
    await this.repository.save(this.toPersistence(data))
  }

  async findById(id: string): Promise<Operation | undefined> {
    const entity = await this.repository.findOne({ id })

    return entity ? this.toDomain(entity) : undefined
  }

  async findLastCompleted(): Promise<Operation | undefined> {
    const entity = await this.repository
      .createQueryBuilder('operation')
      .orderBy('operation.completedAtTs', 'DESC')
      .getOne()

    return entity ? this.toDomain(entity) : undefined
  }

  private toDomain(entity: OperationEntity): Operation {
    return Operation.create(entity.id, entity.completedAtTs, entity.page)
  }

  private toPersistence(data: Operation): OperationEntity {
    return Object.assign(new OperationEntity(), data.properties)
  }
}
