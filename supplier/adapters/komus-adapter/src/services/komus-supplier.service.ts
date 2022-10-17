/* eslint-disable no-await-in-loop */

import { Logger }                     from '@atls/logger'
import { Injectable }                 from '@nestjs/common'
import { Inject }                     from '@nestjs/common'

import assert                         from 'assert'
import { Observable }                 from 'rxjs'
import { v4 as uuid }                 from 'uuid'

import { RequestService }             from '@shared/request-module'
import { Product }                    from '@supplier/domain-module'
import { SupplierService }            from '@supplier/domain-module'
import { GetAllProductsOptions }      from '@supplier/domain-module'
import { InjectProductsRepository }   from '@supplier/domain-module'
import { ProductsRepository }         from '@supplier/domain-module'

import { KOMUS_ADAPTER_CONFIG_TOKEN } from '../config'
import { IKomusAdapterConfig }        from '../config'
import { TokenNotProvidedException }  from '../exceptions'

@Injectable()
export class KomusSupplierService extends SupplierService {
  #logger: Logger = new Logger(KomusSupplierService.name)

  constructor(
    @Inject(KOMUS_ADAPTER_CONFIG_TOKEN)
    private readonly komusConfig: IKomusAdapterConfig,
    private readonly requestService: RequestService,
    @InjectProductsRepository()
    private readonly productsRepository: ProductsRepository
  ) {
    super()
  }

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

  private toAggregate(product: any): Product {
    return Product.create(
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
  }

  getAllProducts(options?: GetAllProductsOptions): Observable<Array<Product>> {
    this.#logger.info('Called getAllProducts()')

    assert.ok(this.komusConfig.token, new TokenNotProvidedException())

    return new Observable<Array<Product>>((subscriber) => {
      const fetchPage = async (page: number) => {
        this.#logger.info(`Fetching page ${page}`)

        const requestUrl = this.buildUrl('/api/elements', {
          format: 'json',
          count: options?.batchSize || 250,
          page,
        })
        const response = await this.requestService.makeRequest(requestUrl)

        for (const product of response.content) {
          const productAggregate = this.toAggregate(product)

          if (options?.detailed) {
            subscriber.next([await this.getDetailedProduct(productAggregate.articleNumber)])
          } else subscriber.next([productAggregate])
        }

        if (response.next && typeof response.next === 'number') {
          fetchPage(response.next)
        } else {
          subscriber.complete()
        }
      }

      fetchPage(options?.startFrom || 1)
    })
  }

  async getDetailedProduct(articleNumber: string): Promise<Product> {
    const requestUrl = this.buildUrl(`/api/elements/${articleNumber}`, {
      format: 'json',
    })

    this.#logger.info(`Retrieving ${articleNumber}`)
    const response = await this.requestService.makeRequest(requestUrl)
    this.#logger.info(`Retrieved ${articleNumber}`)

    return this.toAggregate(response.content[0])
  }
}
