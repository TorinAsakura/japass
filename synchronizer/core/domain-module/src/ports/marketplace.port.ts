import { Observable } from 'rxjs'

export interface MarketplaceProduct {
  name: string
  articleNumber: string
  category: string
  price: number
  manufacturerCountries: Array<string>
  length: number
  width: number
  height: number
  weight: number
  previewImage: string
  pictures: Array<string>
  vendor: string
  vendorCode: string
  barcodes: Array<string>
  description: string
  remains: number
}

export interface CreateProductsRequest {
  products: Array<MarketplaceProduct>
}

export interface MinimalProduct {
  articleNumber: string
  remains: number
}

export interface MinimalPriceProduct {
  articleNumber: string
  price: number
}

export interface UpdateStocksRequest {
  products: Array<MinimalProduct>
}

export interface UpdatePricesRequest {
  products: Array<MinimalPriceProduct>
}

export interface MarketplacePort {
  createProducts(request: CreateProductsRequest): Promise<void>
  getProducts(): Observable<Array<MarketplaceProduct>>
  updateStocks(request: UpdateStocksRequest): Promise<void>
  updatePrices(request: UpdatePricesRequest): Promise<void>
}

export const MARKETPLACE_SERVICE_TOKEN = '__MarketplaceServiceToken'
