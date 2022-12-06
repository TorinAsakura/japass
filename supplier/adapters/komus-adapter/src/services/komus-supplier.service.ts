/* eslint-disable no-await-in-loop */

import { Logger }                     from '@atls/logger'
import { Injectable }                 from '@nestjs/common'
import { Inject }                     from '@nestjs/common'

import assert                         from 'assert'
import { LimitFunction }              from 'p-limit'
import { Observable }                 from 'rxjs'
import { v4 as uuid }                 from 'uuid'

import { RequestService }             from '@shared/request-module'
import { InjectCommonLimit }          from '@supplier/application-module'
import { Product }                    from '@supplier/domain-module'
import { SupplierService }            from '@supplier/domain-module'
import { GetAllProductsOptions }      from '@supplier/domain-module'
import { InjectProductsRepository }   from '@supplier/domain-module'
import { ProductsRepository }         from '@supplier/domain-module'

import { KOMUS_ADAPTER_CONFIG_TOKEN } from '../config'
import { IKomusAdapterConfig }        from '../config'
import { ServerMessage }              from '../enums'
import { TokenNotProvidedException }  from '../exceptions'

@Injectable()
export class KomusSupplierService extends SupplierService {
  #logger: Logger = new Logger(KomusSupplierService.name)

  constructor(
    @Inject(KOMUS_ADAPTER_CONFIG_TOKEN)
    private readonly komusConfig: IKomusAdapterConfig,
    private readonly requestService: RequestService,
    @InjectProductsRepository()
    private readonly productsRepository: ProductsRepository,
    @InjectCommonLimit()
    private readonly commonLimit: LimitFunction
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
      product.countryName || 'Россия',
      `${this.komusConfig.url}${product.images}`,
      (product.listImages || []).map((image) => `${this.komusConfig.url}${image}`),
      Number(product.width),
      Number(product.height),
      Number(product.depth),
      Number(product.weight),
      Number(product.volume),
      (product.barcodes || []).map((b) => b.Value),
      product.tradeGroup,
      new Date()
    )
  }

  private sleep(ms: number) {
    return new Promise((resolve) => {
      setTimeout(resolve, ms)
    })
  }

  getAllProducts(options?: GetAllProductsOptions): Observable<Array<Product>> {
    this.#logger.info('Called getAllProducts()')

    assert.ok(this.komusConfig.token, new TokenNotProvidedException())

    return new Observable<Array<Product>>((subscriber) => {
      const fetchPage = async (page: number) => {
        this.#logger.info(`Fetching page ${page}`)

        await this.sleep(1000)

        const requestUrl = this.buildUrl('/api/elements', {
          format: 'json',
          count: options?.batchSize || 250,
          page,
        })
        const response = await this.requestService.makeRequest(requestUrl)

        if (response.content) {
          for (const product of response.content) {
            const productAggregate = this.toAggregate(product)

            if (options?.detailed) {
              const detailedProduct = await this.getDetailedProduct(productAggregate.articleNumber)
              if (detailedProduct) {
                subscriber.next([detailedProduct])
              }
            } else subscriber.next([productAggregate])
          }

          if (response.next && !Number.isNaN(response.next)) {
            this.commonLimit(() => fetchPage(Number(response.next)))
          } else {
            subscriber.complete()
          }
        } else if (response?.message === ServerMessage.PRODUCT_NOT_FOUND) {
          subscriber.complete()
        }
      }

      fetchPage(options?.startFrom || 1)
    })
  }

  async getDetailedProduct(articleNumber: string): Promise<Product | undefined> {
    const requestUrl = this.buildUrl(`/api/elements/${articleNumber}`, {
      format: 'json',
    })

    await this.sleep(1000)

    this.#logger.info(`Retrieving ${articleNumber}`)
    const response = await this.requestService.makeRequest(requestUrl)
    this.#logger.info(`Retrieved ${articleNumber}`)

    if (!response.content) {
      return undefined
    }

    return this.toAggregate(response.content[0])
  }
}
