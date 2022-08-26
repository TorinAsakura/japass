export interface Attribute {
  name: string
  value: string
}

export interface SupplierProduct {
  id: string
  name: string
  price: number
  remains: number
  articleNumber: string
  attributes?: Array<Attribute>
  code?: string
  description: string
  brand: string
  model?: string
  UOM: string
  nds: number
  imagePreview: string
  images: Array<string>
  width: number
  height: number
  depth: number
  weight: number
  volume: number
  tradeGroup: string
  packagingType?: string
  barcodes?: Array<string>
}

export interface SupplierPort {
  getAllProducts(): Promise<Array<SupplierProduct>>
}

export const SUPPLIER_SERVICE_TOKEN = '__SupplierServiceToken'
