import { Injectable }         from '@nestjs/common'
import { EventBus }           from '@nestjs/cqrs'
import { InjectRepository }   from '@nestjs/typeorm'

import { Repository }         from 'typeorm'

import { ProductEntity }      from '@shared/typeorm-adapter-module'
import { Product }            from '@supplier/domain-module'
import { ProductsRepository } from '@supplier/domain-module'

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
    await this.repository.save(await this.toPersistence(aggregate))

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
      products: (entities || []).map((entity) => this.toDomain(entity)),
      hasNextPage: qb.expressionMap.take ? entities.length >= qb.expressionMap.take : false,
    }
  }

  async findById(id: string): Promise<Product | undefined> {
    const entity = await this.repository.findOne({ id })

    return entity ? this.toDomain(entity) : undefined
  }

  async findByArticleNumber(articleNumber: string): Promise<Product | undefined> {
    const entity = await this.repository.findOne({ articleNumber })

    return entity ? this.toDomain(entity) : undefined
  }

  private toDomain(entity: ProductEntity): Product {
    return new Product({ ...entity })
  }

  private async toPersistence(data: Product): Promise<ProductEntity> {
    return Object.assign(new ProductEntity(), data.properties)
  }
}
