export interface MarketplaceProduct {
  name: string
  articleNumber: string
  category: string
  manufacturer?: string
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
  quantumOfSupply: number
}

export interface CreateProductsRequest {
  products: Array<MarketplaceProduct>
}

export interface MarketplacePort {
  createProducts(request: CreateProductsRequest): Promise<void>
}

export const MARKETPLACE_SERVICE_TOKEN = '__MarketplaceServiceToken'
