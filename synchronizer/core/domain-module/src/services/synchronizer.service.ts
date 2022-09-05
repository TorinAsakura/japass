import { Logger }                              from '@atls/logger'
import { Injectable }                          from '@nestjs/common'
import { Inject }                              from '@nestjs/common'
import { OnApplicationBootstrap }              from '@nestjs/common'

import assert                                  from 'assert'

import { AlreadyInProgressSingletonException } from '../exceptions'
import { MARKETPLACE_SERVICE_TOKEN }           from '../ports'
import { MarketplacePort }                     from '../ports'
import { SUPPLIER_SERVICE_TOKEN }              from '../ports'
import { SupplierPort }                        from '../ports'
import { MarketplaceProduct }                  from '../ports'

@Injectable()
export class SynchronizerService implements OnApplicationBootstrap {
  #logger: Logger = new Logger('SynchronizerService')

  #isInProgress: boolean = false

  constructor(
    @Inject(MARKETPLACE_SERVICE_TOKEN)
    private readonly marketplaceService: MarketplacePort,
    @Inject(SUPPLIER_SERVICE_TOKEN)
    private readonly supplierService: SupplierPort
  ) {}

  async onApplicationBootstrap() {
    this.synchronizeProducts()
  }

  async synchronizeProducts() {
    assert.ok(!this.#isInProgress, new AlreadyInProgressSingletonException())

    this.#logger.info('Called synchronizeProducts()')
    this.#isInProgress = true

    const products = await this.supplierService.getAllProducts()
    this.#logger.info('Fetched all products from supplier')
    const productsToWrite: Array<MarketplaceProduct> = []

    for (const product of products) {
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
        tradeGroup,
        barcodes,
        remains,
      } = product

      productsToWrite.push({
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
        category: tradeGroup,
        vendor: brand,
        vendorCode: articleNumber,
        description,
        remains,
      })
    }

    this.#logger.info('Uploading products to marketplace')

    await this.marketplaceService.createProducts({ products: productsToWrite })

    this.#logger.info('Finished synchronizeProducts()')
    this.#isInProgress = false
  }
}
