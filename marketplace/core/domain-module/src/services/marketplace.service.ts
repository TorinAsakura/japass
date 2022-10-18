import { Inject }     from '@nestjs/common'

import { Observable } from 'rxjs'

import { Product }    from '../aggregates'

export interface CreateProductsRequest {
  products: Array<Product>
}

export interface UpdateStocksRequest {
  products: Array<Product>
}

export interface UpdatePricesRequest {
  products: Array<Product>
}

export abstract class MarketplaceService {
  abstract createProducts(request: CreateProductsRequest): Promise<void>

  abstract getProducts(): Observable<Array<Product>>

  abstract updateStocks(request: UpdateStocksRequest): Promise<void>

  abstract updatePrices(request: UpdatePricesRequest): Promise<void>
}

export const MARKETPLACE_SERVICE_TOKEN = '__marketplaceServiceToken'
export const InjectMarketplaceService = () => Inject(MARKETPLACE_SERVICE_TOKEN)
