import { Logger }                     from '@atls/logger'
import { Injectable }                 from '@nestjs/common'
import { Inject }                     from '@nestjs/common'

import assert                         from 'assert'

import { SupplierPort }               from '@synchronizer/domain-module'
import { SupplierProduct }            from '@synchronizer/domain-module'
import { RequestService }             from '@synchronizer/request-shared-module'

import { KOMUS_ADAPTER_CONFIG_TOKEN } from '../config'
import { IKomusAdapterConfig }        from '../config'
import { TokenNotProvidedException }  from '../exceptions'

@Injectable()
export class KomusService implements SupplierPort {
  #logger: Logger = new Logger('KomusService')

  constructor(
    @Inject(KOMUS_ADAPTER_CONFIG_TOKEN)
    private readonly komusConfig: IKomusAdapterConfig,
    private readonly requestService: RequestService
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

  private async sleep(ms: number) {
    this.#logger.info(`Sleeping for ${ms}ms`)
    return new Promise((resolve) => setTimeout(resolve, ms))
  }

  async getAllProducts(): Promise<Array<SupplierProduct>> {
    this.#logger.info('Called getAllProducts()')

    assert.ok(this.komusConfig.token, new TokenNotProvidedException())

    const fetchedProducts: Array<any> = []
    const fullProducts: Array<any> = []

    const fetchPage = async (page: number) => {
      this.#logger.info(`Fetching page ${page}`)

      const requestUrl = this.buildUrl('/api/elements', { format: 'json', count: 1, page })
      const response = await this.requestService.makeRequest(requestUrl)

      fetchedProducts.push(...response.content)

      // if (typeof response.next === 'number') {
      if (false) {
        await fetchPage(response.next)
      }
    }

    await fetchPage(350)

    for (const product of fetchedProducts) {
      const requestUrl = this.buildUrl(`/api/elements/${product.artnumber}`, {
        format: 'json',
      })

      this.#logger.info(`Retrieving ${product.artnumber}`)
      const response = await this.requestService.makeRequest(requestUrl)
      this.#logger.info(`Retrieved ${product.artnumber}`)

      fullProducts.push(...response.content)
    }

    this.#logger.info('Finished getAllProducts()')
    return fullProducts.map((product) => ({
      id: product.id,
      brand: product.brand.name,
      articleNumber: product.artnumber,
      country: product.countryName,
      name: product.name,
      price: product.price,
      remains: product.remains,
      description: product.description,
      attributes: product.Specifications,
      width: product.width,
      height: product.height,
      weight: product.weight,
      depth: product.depth,
      volume: product.volume,
      packagingType: product.packagingType,
      tradeGroup: product.tradeGroup,
      barcodes: (product.barcodes || []).map((b) => b.Value),
      imagePreview: `${this.komusConfig.url}${product.images}`,
      images: (product.listImages || []).map((image) => `${this.komusConfig.url}${product.images}`),
      UOM: product.Unit,
      nds: product.nds,
      code: product.code,
    }))
  }
}
