import { Product } from '../aggregates'

export const PRODUCTS_REPOSITORY_TOKEN = 'PRODUCTS_REPOSITORY_TOKEN'

export abstract class ProductsRepository {
  create(): Product {
    return new Product()
  }

  abstract save(aggregate: Product): Promise<void>

  abstract findAll(
    take: number,
    skip: number
  ): Promise<{ products: Array<Product>; hasNextPage: boolean }>

  abstract findById(id: string): Promise<Product | undefined>

  abstract findByArticleNumber(articleNumber: string): Promise<Product | undefined>
}
