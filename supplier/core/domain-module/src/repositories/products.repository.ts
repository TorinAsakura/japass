import { Inject }  from '@nestjs/common'

import { Product } from '../aggregates'

export const PRODUCTS_REPOSITORY_TOKEN = 'PRODUCTS_REPOSITORY_TOKEN'
export const InjectProductsRepository = () => Inject(PRODUCTS_REPOSITORY_TOKEN)

export type MapAllProductsCallback = (
  products: Array<Product>,
  page: number
) => Promise<void> | void

export abstract class ProductsRepository {
  abstract save(aggregate: Product): Promise<void>

  abstract findAll(
    take: number,
    skip: number
  ): Promise<{ products: Array<Product>; hasNextPage: boolean }>

  abstract findById(id: string): Promise<Product | undefined>

  abstract findByArticleNumber(articleNumber: string): Promise<Array<Product>>

  abstract findStale(): Promise<Array<Product>>

  abstract remove(id: string): Promise<void>

  abstract mapAllProducts(cb: MapAllProductsCallback): Promise<void>
}
