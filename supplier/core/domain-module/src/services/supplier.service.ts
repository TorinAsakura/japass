import { Inject }     from '@nestjs/common'

import { Observable } from 'rxjs'

import { Product }    from '../aggregates'

export interface GetAllProductsOptions {
  detailed?: boolean
  startFrom?: number
  batchSize?: number
}

export abstract class SupplierService {
  abstract getAllProducts(options: GetAllProductsOptions): Observable<Array<Product>>

  abstract getDetailedProduct(articleNumber: string): Promise<Product | undefined>
}

export const SUPPLIER_SERVICE_TOKEN = '__supplierServiceToken'
export const InjectSupplierService = () => Inject(SUPPLIER_SERVICE_TOKEN)
