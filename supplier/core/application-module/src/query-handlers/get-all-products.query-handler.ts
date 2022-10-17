import { QueryHandler }          from '@nestjs/cqrs'
import { IQueryHandler }         from '@nestjs/cqrs'

import { Observable }            from 'rxjs'

import { InjectSupplierService } from '@supplier/domain-module'
import { SupplierService }       from '@supplier/domain-module'
import { Product }               from '@supplier/domain-module'

import { GetAllProductsQuery }   from '../queries'

@QueryHandler(GetAllProductsQuery)
export class GetAllProductsQueryHandler implements IQueryHandler<GetAllProductsQuery> {
  constructor(
    @InjectSupplierService()
    private readonly supplierService: SupplierService
  ) {}

  async execute(query: GetAllProductsQuery): Promise<Observable<Array<Product>>> {
    return this.supplierService.getAllProducts(query)
  }
}
