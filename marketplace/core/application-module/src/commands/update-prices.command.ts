import { Product } from '@marketplace/domain-module'

export class UpdatePricesCommand {
  constructor(public readonly products: Array<Product>) {}
}
