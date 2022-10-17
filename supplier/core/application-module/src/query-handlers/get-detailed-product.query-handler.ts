import { QueryHandler }            from '@nestjs/cqrs'
import { IQueryHandler }           from '@nestjs/cqrs'

import { InjectSupplierService }   from '@supplier/domain-module'
import { SupplierService }         from '@supplier/domain-module'
import { Product }                 from '@supplier/domain-module'

import { GetDetailedProductQuery } from '../queries'

@QueryHandler(GetDetailedProductQuery)
export class GetDetailedProductQueryHandler implements IQueryHandler<GetDetailedProductQuery> {
  constructor(
    @InjectSupplierService()
    private readonly supplierService: SupplierService
  ) {}

  async execute({ articleNumber }: GetDetailedProductQuery): Promise<Product> {
    return this.supplierService.getDetailedProduct(articleNumber)
  }
}
