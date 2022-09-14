/* eslint-disable no-await-in-loop */

import { Logger }                      from '@atls/logger'
import { Injectable }                  from '@nestjs/common'
import { Inject }                      from '@nestjs/common'

import assert                          from 'assert'
import { Observable }                  from 'rxjs'
import { v4 as uuid }                  from 'uuid'

import { SupplierPort }                from '@synchronizer/domain-module'
import { Product }                     from '@synchronizer/domain-module'
import { PRODUCTS_REPOSITORY_TOKEN }   from '@synchronizer/domain-module'
import { ProductsRepository }          from '@synchronizer/domain-module'
import { OPERATIONS_REPOSITORY_TOKEN } from '@synchronizer/domain-module'
import { OperationsRepository }        from '@synchronizer/domain-module'
import { GetAllProductsOptions }       from '@synchronizer/domain-module'
import { RequestService }              from '@synchronizer/request-shared-module'

import { KOMUS_ADAPTER_CONFIG_TOKEN }  from '../config'
import { IKomusAdapterConfig }         from '../config'
import { TokenNotProvidedException }   from '../exceptions'

@Injectable()
export class KomusService implements SupplierPort {
  #logger: Logger = new Logger('KomusService')

  constructor(
    @Inject(KOMUS_ADAPTER_CONFIG_TOKEN)
    private readonly komusConfig: IKomusAdapterConfig,
    private readonly requestService: RequestService,
    @Inject(PRODUCTS_REPOSITORY_TOKEN)
    private readonly productsRepository: ProductsRepository,
    @Inject(OPERATIONS_REPOSITORY_TOKEN)
    private readonly operationsRepository: OperationsRepository
  ) {}

  private buildUrl(path: string, requestParams = {}) {
    const stringifiedParams = Object.entries({
      token: this.komusConfig.token,
      ...requestParams,
    }).reduce(
      (string, [key, value], index) => `${string}${index === 0 ? '' : '&'}${key}=${value}`,
      '?'
    )

    return `${this.komusConfig.url}${path}${stringifiedParams}`
  }

  private async transformProduct(product): Promise<Product> {
    const existingProduct = await this.productsRepository.findByArticleNumber(product.artnumber)

    if (existingProduct) {
      await existingProduct.update(Number(product.price), Number(product.remains))
      return existingProduct
    }

    const newAggregate = this.productsRepository.create()

    await newAggregate.create(
      uuid(),
      product.name,
      Number(product.price),
      Number(product.remains),
      product.artnumber,
      product.code,
      product.description,
      product.brand?.name,
      product.Unit,
      Number(product.nds),
      product.countryName,
      `${this.komusConfig.url}${product.images}`,
      (product.listImages || []).map((image) => `${this.komusConfig.url}${product.images}`),
      Number(product.width),
      Number(product.height),
      Number(product.depth),
      Number(product.weight),
      Number(product.volume),
      (product.barcodes || []).map((b) => b.Value),
      product.tradeGroup
    )

    return newAggregate
  }

  async getDetailedProduct(articleNumber: string): Promise<Product> {
    const requestUrl = this.buildUrl(`/api/elements/${articleNumber}`, {
      format: 'json',
    })

    this.#logger.info(`Retrieving ${articleNumber}`)
    const response = await this.requestService.makeRequest(requestUrl)
    this.#logger.info(`Retrieved ${articleNumber}`)

    return this.transformProduct(response.content[0])
  }

  getAllProducts(options?: GetAllProductsOptions): Observable<Product> {
    this.#logger.info('Called getAllProducts()')

    assert.ok(this.komusConfig.token, new TokenNotProvidedException())

    const $productsObservable = new Observable<Product>((subscriber) => {
      const fetchPage = async (page: number) => {
        this.#logger.info(`Fetching page ${page}`)

        const requestUrl = this.buildUrl('/api/elements', { format: 'json', count: 250, page })
        const response = await this.requestService.makeRequest(requestUrl)

        for (const product of response.content) {
          const productAggregate = await this.transformProduct(product)

          if (options?.detailed) {
            subscriber.next(await this.getDetailedProduct(productAggregate.articleNumber))
            const lastOperation = await this.operationsRepository.findLastCompleted()
            await lastOperation!.update(Date.now(), page)
            await this.operationsRepository.save(lastOperation!)
          } else subscriber.next(productAggregate)
        }

        if (response.next && typeof response.next === 'number') {
          await fetchPage(response.next)
        } else {
          subscriber.complete()
        }
      }

      fetchPage(options?.startFrom || 1)
    })

    this.#logger.info('Finished getAllProducts()')

    return $productsObservable
  }
}
