import { Injectable }         from '@nestjs/common'
import { EventBus }           from '@nestjs/cqrs'
import { InjectRepository }   from '@nestjs/typeorm'

import { Repository }         from 'typeorm'

import { Product }            from '@synchronizer/domain-module'
import { ProductsRepository } from '@synchronizer/domain-module'

import { ProductEntity }      from '../entities'

@Injectable()
export class ProductsRepositoryImpl extends ProductsRepository {
  constructor(
    @InjectRepository(ProductEntity)
    private readonly repository: Repository<ProductEntity>,
    private readonly eventBus: EventBus
  ) {
    super()
  }

  async save(aggregate: Product): Promise<void> {
    await this.repository.save(await this.aggregateToEntity(aggregate))

    if (aggregate.getUncommittedEvents().length > 0) {
      this.eventBus.publishAll(aggregate.getUncommittedEvents())
    }

    aggregate.commit()
  }

  async findAll(
    take: number,
    skip: number
  ): Promise<{ products: Array<Product>; hasNextPage: boolean }> {
    const qb = await this.repository
      .createQueryBuilder('product')
      .skip(skip * take)
      .take(take)

    const entities = await qb.getMany()

    return {
      products: (entities || []).map((entity) => this.entityToAggregate(entity)),
      hasNextPage: qb.expressionMap.take ? entities.length >= qb.expressionMap.take : false,
    }
  }

  async findById(id: string): Promise<Product | undefined> {
    const entity = await this.repository.findOne({ id })

    return entity ? this.entityToAggregate(entity) : undefined
  }

  async findByArticleNumber(articleNumber: string): Promise<Product | undefined> {
    const entity = await this.repository.findOne({ articleNumber })

    return entity ? this.entityToAggregate(entity) : undefined
  }

  private entityToAggregate(entity: ProductEntity): Product {
    return new Product({
      ...entity,
    })
  }

  private async aggregateToEntity(data: Product): Promise<ProductEntity> {
    return Object.assign(new ProductEntity(), data.properties)
  }
}
