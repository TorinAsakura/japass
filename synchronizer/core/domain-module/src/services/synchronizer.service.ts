/* eslint-disable no-await-in-loop */

import { Logger }                              from '@atls/logger'
import { Injectable }                          from '@nestjs/common'
import { Inject }                              from '@nestjs/common'

import assert                                  from 'assert'

import { Product }                             from '../aggregates'
import { AlreadyInProgressSingletonException } from '../exceptions'
import { MARKETPLACE_SERVICE_TOKEN }           from '../ports'
import { MarketplacePort }                     from '../ports'
import { SUPPLIER_SERVICE_TOKEN }              from '../ports'
import { SupplierPort }                        from '../ports'
import { ProductsRepository }                  from '../repositories'
import { PRODUCTS_REPOSITORY_TOKEN }           from '../repositories'

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
    private readonly productsRepository: ProductsRepository
  ) {}

  private async mapAllProducts(cb: (product: Product) => Promise<void> | void): Promise<void> {
    const iterate = async (page) => {
      const result = await this.productsRepository.findAll(500, page)

      for (const product of result.products) {
        await cb(product)
      }

      if (result.hasNextPage) {
        iterate(page + 1)
      }
    }

    iterate(0)
  }

  async synchronizeProductsWithDb() {
    this.#logger.info('Called synchronizeProductsWithDb()')

    await this.mapAllProducts(async (product) => {
      const retrievedProduct = await this.supplierService.getDetailedProduct(product.articleNumber)

      if (
        product.remains !== retrievedProduct.remains ||
        product.price !== retrievedProduct.price
      ) {
        await product.update(retrievedProduct.price, retrievedProduct.remains)
        await this.productsRepository.save(product)
      }
    })

    this.#logger.info('Finished synchronizeProductsWithDb()')
  }

  async synchronizeProductsWithMarketplace() {
    this.#logger.info('Called synchronizeProductsWithMarketplace()')

    await this.mapAllProducts(async (product) => {
      const {
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
      } = product

      await this.marketplaceService.createProducts({
        products: [
          {
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
          },
        ],
      })

      this.#logger.info('Finished synchronizeProductsWithMarketplace()')
    })
  }

  async writeProducts() {
    assert.ok(!this.#isInProgress, new AlreadyInProgressSingletonException())

    this.#logger.info('Called writeProducts()')
    this.#isInProgress = true

    const $productsObservable = this.supplierService.getAllProducts()

    $productsObservable.subscribe({
      next: async (product) => {
        this.#logger.info(`Writing product ${product.articleNumber} to db`)
        await this.productsRepository.save(product)
      },
      complete: () => {
        this.#logger.info('Completed writing all products')
        this.#isInProgress = false
      },
    })

    this.#logger.info('Finished writeProducts()')
  }
}
