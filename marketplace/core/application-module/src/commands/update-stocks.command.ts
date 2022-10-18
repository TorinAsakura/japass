import { Product } from '@marketplace/domain-module'

export class UpdateStocksCommand {
  constructor(public readonly products: Array<Product>) {}
}
