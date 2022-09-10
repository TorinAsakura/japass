import { Logger }                             from '@atls/logger'
import { Injectable }                         from '@nestjs/common'
import { Inject }                             from '@nestjs/common'

import assert                                 from 'assert'

import { MarketplacePort }                    from '@synchronizer/domain-module'
import { CreateProductsRequest }              from '@synchronizer/domain-module'
import { RequestService }                     from '@synchronizer/request-shared-module'

import { YANDEX_MARKET_ADAPTER_CONFIG_TOKEN } from '../config'
import { IYandexMarketAdapterConfig }         from '../config'
import { TokenNotProvidedException }          from '../exceptions'
import { ClientIdNotProvidedException }       from '../exceptions'
import { CampaignIdNotProvidedException }     from '../exceptions'

@Injectable()
export class YandexMarketService implements MarketplacePort {
  #logger: Logger = new Logger('YandexMarketService')

  constructor(
    @Inject(YANDEX_MARKET_ADAPTER_CONFIG_TOKEN)
    private readonly options: IYandexMarketAdapterConfig,
    private readonly requestService: RequestService
  ) {}

  private buildUrl(path: string) {
    return `${this.options.url}${path.replace('{campaignId}', this.options.campaignId)}`
  }

  private buildHeaders() {
    return {
      'content-type': 'application/json',
      Authorization: `OAuth oauth_token=${this.options.token}, oauth_client_id=${this.options.clientId}`,
    }
  }

  async createProducts(request: CreateProductsRequest): Promise<void> {
    this.#logger.info('Called createProducts()')

    assert.ok(this.options.token, new TokenNotProvidedException())
    assert.ok(this.options.clientId, new ClientIdNotProvidedException())
    assert.ok(this.options.campaignId, new CampaignIdNotProvidedException())

    const products: Array<object> = []

    for (const product of request.products) {
      products.push({
        offer: {
          name: product.name,
          category: product.category,
          manufacturerCountries: product.manufacturerCountries,
          shopSku: Number(product.articleNumber),
          weightDimensions: {
            width: product.width,
            height: product.height,
            weight: product.weight,
            length: product.length,
          },
          pictures: product.pictures,
          urls: [product.previewImage],
          vendor: product.vendor,
          vendorCode: product.vendorCode,
          barcodes: product.barcodes,
          description: product.description,
        },
      })
    }

    this.#logger.info('Creating products')
    await this.requestService.makeRequest(
      this.buildUrl('/campaigns/{campaignId}/offer-mapping-entries/updates'),
      {
        method: 'POST',
        headers: this.buildHeaders(),
        body: JSON.stringify({
          offerMappingEntries: products,
        }),
      }
    )
    this.#logger.info('Created products')

    this.#logger.info('Setting prices')
    await this.requestService.makeRequest(
      this.buildUrl('/campaigns/{campaignId}/offer-prices/updates'),
      {
        method: 'POST',
        headers: this.buildHeaders(),
        body: JSON.stringify({
          offers: request.products.map((product) => ({
            id: Number(product.articleNumber),
            price: {
              currencyId: 'RUR',
              value: Number(product.price),
            },
          })),
        }),
      }
    )
    this.#logger.info('Setted prices')

    this.#logger.info('Setting stocks')
    await this.requestService.makeRequest(this.buildUrl('/campaigns/{campaignId}/offers/stocks'), {
      method: 'PUT',
      headers: this.buildHeaders(),
      body: JSON.stringify({
        skus: request.products.map((product) => ({
          sku: Number(product.articleNumber),
          warehouseId: this.options.warehouseId,
          items: [
            {
              type: 'FIT',
              count: product.remains,
              updatedAt: new Date().toISOString(),
            },
          ],
        })),
      }),
    })
    this.#logger.info('Setted stocks')

    this.#logger.info('Finished createProducts()')
  }
}
