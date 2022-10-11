/* eslint-disable no-await-in-loop */

import { Logger }                                        from '@atls/logger'
import { Injectable }                                    from '@nestjs/common'
import { Inject }                                        from '@nestjs/common'

import assert                                            from 'assert'
import pLimit                                            from 'p-limit'
import { v4 as uuid }                                    from 'uuid'

import { Product }                                       from '../aggregates'
import { AlreadyInProgressSingletonException }           from '../exceptions'
import { MARKETPLACE_SERVICE_TOKEN }                     from '../ports'
import { MarketplaceProduct } from '../ports'
import { MarketplacePort }                               from '../ports'
import { SUPPLIER_SERVICE_TOKEN }                        from '../ports'
import { SupplierPort }                                  from '../ports'
import { ProductsRepository }                            from '../repositories'
import { PRODUCTS_REPOSITORY_TOKEN }                     from '../repositories'
import { OPERATIONS_REPOSITORY_TOKEN }                   from '../repositories'
import { REWRITE_ENFORCER_REPOSITORY_TOKEN }             from '../repositories'
import { RewriteEnforcerRepository }                     from '../repositories'
import { OperationsRepository }                          from '../repositories'
import { applyProductPriceFormula }                      from '../formulas'
import { applyMinPriceFormula }                          from '../formulas'
import { applyMinOrderFormula }                          from '../formulas'

@Injectable()
export class SynchronizerService {
  #logger: Logger = new Logger('SynchronizerService')

  #isInProgress: boolean = false

  #rewriteEnforcerFlag: boolean = false

  constructor(
    @Inject(MARKETPLACE_SERVICE_TOKEN)
    private readonly marketplaceService: MarketplacePort,
    @Inject(SUPPLIER_SERVICE_TOKEN)
    private readonly supplierService: SupplierPort,
    @Inject(PRODUCTS_REPOSITORY_TOKEN)
    private readonly productsRepository: ProductsRepository,
    @Inject(OPERATIONS_REPOSITORY_TOKEN)
    private readonly operationsRepository: OperationsRepository,
    @Inject(REWRITE_ENFORCER_REPOSITORY_TOKEN)
    private readonly rewriteEnforcerRepository: RewriteEnforcerRepository
  ) {}

  private async mapAllProducts(
    cb: (product: Product, page: number) => Promise<void> | void
  ): Promise<void> {
    const iterate = async (page) => {
      const result = await this.productsRepository.findAll(250, page)

      for (const product of result.products) {
        await cb(product, page)
      }

      if (result.hasNextPage) {
        await iterate(page + 1)
      }
    }

    await iterate(0)
  }

  private async mapAllProductBatches(
    cb: (products: Array<Product>, page: number) => Promise<void> | void
  ): Promise<void> {
    const iterate = async (page) => {
      const result = await this.productsRepository.findAll(50, page)

      await cb(result.products, page)

      if (result.hasNextPage) {
        await iterate(page + 1)
      }
    }

    await iterate(0)
  }

  private productToMarketplaceProduct(product: Product): MarketplaceProduct {
    return {
      name: product.name,
      width: product.width,
      height: product.height,
      weight: product.weight,
      length: product.depth,
      previewImage: product.imagePreview,
      pictures: product.images,
      price: product.price,
      manufacturerCountries: [product.country],
      barcodes: product.barcodes || [],
      articleNumber: product.articleNumber,
      category: product.category,
      vendor: product.brand,
      vendorCode: product.articleNumber,
      description: product.description,
      remains: product.remains,
    }
  }

  async synchronizeProductsWithDb() {
    this.#logger.info('Called synchronizeProductsWithDb()')

    let resolve: CallableFunction
    const promise = new Promise<void>((_resolve) => {
      resolve = _resolve
    })
    const $productsObservable = this.supplierService.getAllProducts({ detailed: false })

    $productsObservable.subscribe({
      next: async (product) => {
        const retrievedProduct = await this.productsRepository.findByArticleNumber(
          product.articleNumber
        )

        if (!retrievedProduct) {
          return
        }

        this.#logger.info(`Synchronizing product ${product.articleNumber} with db`)

        if (product.country) {
          this.#logger.info(`Updating product ${product.articleNumber}`)
          await retrievedProduct.update(applyProductPriceFormula(product.price), product.remains)
          await this.productsRepository.save(retrievedProduct)
        }
      },
      complete: () => {
        this.#logger.info('Completed synchronizing all products')
        resolve(undefined)
      },
    })

    await promise
    this.#logger.info('Finished synchronizeProductsWithDb()')
  }

  async synchronizeProductsWithMarketplace() {
    this.#logger.info('Called synchronizeProductsWithMarketplace()')

    const $productsObservable = await this.marketplaceService.getProducts()

    $productsObservable.subscribe({
      next: async (products) => {
        const limit = pLimit(1)

        await Promise.all(
          products.map((product) =>
            limit(async () => {
              const prettyShopSku = (rawSku: string): string => {
                const parts = rawSku.split('-')
                if (parts.length > 1) {
                  return parts.pop() || ''
                }

                return rawSku
              }

              const prettifiedSku = prettyShopSku(product.articleNumber)
              const dbProduct = await this.productsRepository.findByArticleNumber(prettifiedSku)

              if (!dbProduct) return

              if (dbProduct.remains < 10) {
                await this.marketplaceService.updateStocks({
                  products: [{ articleNumber: dbProduct.articleNumber, remains: 0 }],
                })

                return
              }

              if (dbProduct.price < 150) {
                const minOrder = applyMinOrderFormula(dbProduct.price)
                const minPrice = applyMinPriceFormula(minOrder, dbProduct.price)
                const priceWithExtraCharge = applyProductPriceFormula(minPrice)

                if (priceWithExtraCharge !== product.price) {
                  await this.marketplaceService.createProducts({
                    products: [
                      {
                        ...product,
                        name: `${product.name} (${minOrder} шт.)`,
                      },
                    ],
                  })

                  await this.marketplaceService.updatePrices({
                    products: [
                      {
                        articleNumber: product.articleNumber,
                        price: priceWithExtraCharge,
                      },
                    ],
                  })
                }
              } else if (applyProductPriceFormula(dbProduct.price) !== product.price) {
                await this.marketplaceService.updatePrices({
                  products: [
                    {
                      articleNumber: product.articleNumber,
                      price: applyProductPriceFormula(dbProduct.price),
                    },
                  ],
                })
              }

              if (product.remains !== dbProduct.remains) {
                await this.marketplaceService.updateStocks({
                  products: [{ articleNumber: product.articleNumber, remains: dbProduct.remains }],
                })
              }
            }))
        )
      },
      complete: () => {
        this.#logger.info('Finished synchronizeProductsWithMarketplace()')
      },
    })
  }

  async synchronizeStocksWithMarketplace() {
    this.#logger.info('Called synchronizeStocksWithMarketplace()')

    const $productsObservable = await this.marketplaceService.getProducts()

    $productsObservable.subscribe({
      next: (products) => {
        this.marketplaceService.updateStocks({
          products,
        })
      },
      complete: () => {
        this.#logger.info('Finished synchronizeStocksWithMarketplace()')
      },
    })
  }

  async writeAllProductsToMarketplace() {
    assert.ok(!this.#isInProgress, new AlreadyInProgressSingletonException())

    this.#logger.info('Called writeAllProductsToMarketplace()')

    await this.mapAllProductBatches(async (products) => {
      await this.marketplaceService.createProducts({
        products: products.map(this.productToMarketplaceProduct),
      })
    })

    this.#logger.info('Called writeAllProductsToMarketplace()')
  }

  async writeProducts() {
    assert.ok(!this.#isInProgress, new AlreadyInProgressSingletonException())

    this.#logger.info('Called writeProducts()')
    this.#isInProgress = true

    const getLastOperation = async () => {
      const lastOperation = await this.operationsRepository.findLastCompleted()

      if (!lastOperation) {
        const newOperation = this.operationsRepository.create()
        await newOperation.create(uuid(), Date.now(), 0)
        await this.operationsRepository.save(newOperation)
        return newOperation
      }

      return lastOperation
    }

    const lastOperation = await getLastOperation()

    const getStartFrom = async (): Promise<number> => {
      const rewriteEnforcer = await this.rewriteEnforcerRepository.findOne()

      if (!rewriteEnforcer) {
        const newRewriteEnforcer = this.rewriteEnforcerRepository.create()

        await newRewriteEnforcer.create(uuid(), false)

        if (newRewriteEnforcer.flag !== this.#rewriteEnforcerFlag) {
          await newRewriteEnforcer.update(this.#rewriteEnforcerFlag)
          await this.rewriteEnforcerRepository.save(newRewriteEnforcer)
          this.#logger.info('Writing products from scratch')
          return 0
        }

        await this.rewriteEnforcerRepository.save(newRewriteEnforcer)
        return lastOperation.page
      }

      if (rewriteEnforcer.flag !== this.#rewriteEnforcerFlag) {
        await rewriteEnforcer.update(this.#rewriteEnforcerFlag)
        await this.rewriteEnforcerRepository.save(rewriteEnforcer)
        this.#logger.info('Writing products from scratch')
        return 0
      }

      return lastOperation.page
    }

    let resolve: CallableFunction
    const promise = new Promise<void>((_resolve) => {
      resolve = _resolve
    })
    const $productsObservable = this.supplierService.getAllProducts({
      detailed: true,
      startFrom: await getStartFrom(),
    })

    $productsObservable.subscribe({
      next: async (product) => {
        await product.update(applyProductPriceFormula(product.price), product.remains)

        await this.productsRepository.save(product)
      },
      complete: () => {
        this.#logger.info('Completed writing all products')
        this.#isInProgress = false
        resolve(undefined)
      },
    })

    await promise
    this.#logger.info('Finished writeProducts()')
  }
}
