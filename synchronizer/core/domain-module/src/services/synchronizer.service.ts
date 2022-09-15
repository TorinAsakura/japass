/* eslint-disable no-await-in-loop */

import { Logger }                              from '@atls/logger'
import { Injectable }                          from '@nestjs/common'
import { Inject }                              from '@nestjs/common'

import assert                                  from 'assert'
import { v4 as uuid }                          from 'uuid'

import { Product }                             from '../aggregates'
import { AlreadyInProgressSingletonException } from '../exceptions'
import { MARKETPLACE_SERVICE_TOKEN }           from '../ports'
import { MarketplacePort }                     from '../ports'
import { SUPPLIER_SERVICE_TOKEN }              from '../ports'
import { SupplierPort }                        from '../ports'
import { ProductsRepository }                  from '../repositories'
import { PRODUCTS_REPOSITORY_TOKEN }           from '../repositories'
import { OPERATIONS_REPOSITORY_TOKEN }         from '../repositories'
import { OperationsRepository }                from '../repositories'
import { productPriceFormula }                 from '../formulas'

@Injectable()
export class SynchronizerService {
  #logger: Logger = new Logger('SynchronizerService')

  #isInProgress: boolean = false

  constructor(
    @Inject(MARKETPLACE_SERVICE_TOKEN)
    private readonly marketplaceService: MarketplacePort,
    @Inject(SUPPLIER_SERVICE_TOKEN)
    private readonly supplierService: SupplierPort,
    @Inject(PRODUCTS_REPOSITORY_TOKEN)
    private readonly productsRepository: ProductsRepository,
    @Inject(OPERATIONS_REPOSITORY_TOKEN)
    private readonly operationsRepository: OperationsRepository
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

        await product.update(productPriceFormula(product.price), product.remains)

        if (product.country) {
          if (
            product.remains !== retrievedProduct.remains ||
            product.price !== retrievedProduct.price
          ) {
            this.#logger.info(`Updating product ${product.articleNumber}`)
            await product.update(retrievedProduct.price, retrievedProduct.remains)
            await this.productsRepository.save(product)
          }
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

    await this.mapAllProductBatches(async (products) => {
      if (products.length > 0) {
        this.#logger.info(`Trying to write ${products.length} products`)

        await this.marketplaceService.createProducts({
          products: products.map(({
            name,
            price,
            articleNumber,
            country,
            description,
            brand,
            imagePreview,
            images,
            weight,
            width,
            height,
            depth,
            barcodes,
            remains,
            category,
          }) => ({
            name,
            width,
            height,
            weight,
            length: depth,
            previewImage: imagePreview,
            pictures: images,
            price,
            manufacturerCountries: [country],
            barcodes: barcodes || [],
            articleNumber,
            category,
            vendor: brand,
            vendorCode: articleNumber,
            description,
            remains,
          })),
        })
      }

      this.#logger.info('Finished synchronizeProductsWithMarketplace()')
    })
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

    let resolve: CallableFunction
    const promise = new Promise<void>((_resolve) => {
      resolve = _resolve
    })
    const $productsObservable = this.supplierService.getAllProducts({
      detailed: true,
      startFrom: lastOperation.page,
    })

    $productsObservable.subscribe({
      next: async (product) => {
        if (product.country) {
          this.#logger.info(`Writing product ${product.articleNumber} to db`)

          await product.update(productPriceFormula(product.price), product.remains)

          await this.productsRepository.save(product)
        }
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
