import { Product } from '@marketplace/domain-module'

export class CreateProductsCommand {
  constructor(public readonly products: Array<Product>) {}
}
