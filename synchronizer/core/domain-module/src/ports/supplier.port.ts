import { Observable } from 'rxjs'

import { Product }    from '../aggregates'

export interface GetAllProductsOptions {
  detailed?: boolean
  startFrom?: number
}

export interface SupplierPort {
  getAllProducts(options?: GetAllProductsOptions): Observable<Product>
  getDetailedProduct(articleNumber: string): Promise<Product>
}

export const SUPPLIER_SERVICE_TOKEN = '__SupplierServiceToken'
