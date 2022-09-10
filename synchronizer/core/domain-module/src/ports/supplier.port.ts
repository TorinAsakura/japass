import { Observable } from 'rxjs'

import { Product }    from '../aggregates'

export interface SupplierPort {
  getAllProducts(): Observable<Product>
  getDetailedProduct(articleNumber: string): Promise<Product>
}

export const SUPPLIER_SERVICE_TOKEN = '__SupplierServiceToken'
