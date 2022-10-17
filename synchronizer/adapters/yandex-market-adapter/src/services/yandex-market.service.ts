import { Logger }                             from '@atls/logger'
import { Injectable }                         from '@nestjs/common'
import { Inject }                             from '@nestjs/common'

import assert                                 from 'assert'
import pLimit                                 from 'p-limit'
import { LimitFunction }                      from 'p-limit'
import { Observable }                         from 'rxjs'

import { MarketplacePort }                    from '@synchronizer/domain-module'
import { CreateProductsRequest }              from '@synchronizer/domain-module'
import { MarketplaceProduct }                 from '@synchronizer/domain-module'
import { UpdateStocksRequest }                from '@synchronizer/domain-module'
import { UpdatePricesRequest }                from '@synchronizer/domain-module'
import { RequestService }                     from '@synchronizer/request-shared-module'

import { YANDEX_MARKET_ADAPTER_CONFIG_TOKEN } from '../config'
import { IYandexMarketAdapterConfig }         from '../config'
import { TokenNotProvidedException }          from '../exceptions'
import { ClientIdNotProvidedException }       from '../exceptions'
import { CampaignIdNotProvidedException }     from '../exceptions'

@Injectable()
export class YandexMarketService implements MarketplacePort {
  #logger: Logger = new Logger('YandexMarketService')

  #limit: LimitFunction = pLimit(1)

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

  getProducts(): Observable<Array<MarketplaceProduct>> {
    this.#logger.info('Called getProducts()')

    assert.ok(this.options.token, new TokenNotProvidedException())
    assert.ok(this.options.clientId, new ClientIdNotProvidedException())
    assert.ok(this.options.campaignId, new CampaignIdNotProvidedException())

    const $productsObservable = new Observable<Array<MarketplaceProduct>>((subscriber) => {
      const fetchPage = async (pageToken?: string) => {
        const response = await this.#limit(() =>
          this.requestService.makeRequest(
            this.buildUrl(
              `/v2/campaigns/{campaignId}/offer-mapping-entries.json?limit=50${
                pageToken ? `&page_token=${pageToken}` : ''
              }`
            ),
            {
              method: 'GET',
              headers: this.buildHeaders(),
            }
          ))

        if (response.result?.offerMappingEntries) {
          subscriber.next(
            response.result.offerMappingEntries.map(({ offer, ...position }) => ({
              articleNumber: offer.shopSku,
              ...position,
            }))
          )

          if (response.result.paging.nextPageToken) {
            fetchPage(response.result.paging.nextPageToken)
          } else subscriber.complete()
        } else {
          subscriber.complete()
        }
      }

      fetchPage()
    })

    this.#logger.info('Finished getProducts()')

    return $productsObservable
  }

  async updateStocks(request: UpdateStocksRequest): Promise<void> {
    this.#logger.info('Called updateStocks()')

    assert.ok(this.options.token, new TokenNotProvidedException())
    assert.ok(this.options.clientId, new ClientIdNotProvidedException())
    assert.ok(this.options.campaignId, new CampaignIdNotProvidedException())

    await this.#limit(() =>
      this.requestService.makeRequest(this.buildUrl('/campaigns/{campaignId}/offers/stocks'), {
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
      }))

    this.#logger.info('Finished updateStocks()')
  }

  async updatePrices(request: UpdatePricesRequest): Promise<void> {
    this.#logger.info('Called updatePrices()')

    assert.ok(this.options.token, new TokenNotProvidedException())
    assert.ok(this.options.clientId, new ClientIdNotProvidedException())
    assert.ok(this.options.campaignId, new CampaignIdNotProvidedException())

    await this.#limit(() =>
      this.requestService.makeRequest(
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
      ))

    this.#logger.info('Finished updatePrices()')
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

    await this.#limit(() =>
      this.requestService
        .makeRequest(this.buildUrl('/campaigns/{campaignId}/offer-mapping-entries/updates'), {
          method: 'POST',
          headers: this.buildHeaders(),
          body: JSON.stringify({
            offerMappingEntries: products,
          }),
        })
        .then((res) => this.#logger.info(res)))

    this.#logger.info('Finished createProducts()')
  }
}
