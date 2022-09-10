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

export interface MarketplacePort {
  createProducts(request: CreateProductsRequest): Promise<void>
}

export const MARKETPLACE_SERVICE_TOKEN = '__MarketplaceServiceToken'
