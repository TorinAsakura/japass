import { Logger }                             from '@atls/logger'
import { Injectable }                         from '@nestjs/common'
import { Inject }                             from '@nestjs/common'

import assert                                 from 'assert'
import pLimit                                 from 'p-limit'
import { LimitFunction }                      from 'p-limit'
import { Observable }                         from 'rxjs'
import { v4 as uuid }                         from 'uuid'

import { MarketplaceService }                 from '@marketplace/domain-module'
import { Product }                            from '@marketplace/domain-module'
import { CreateProductsRequest }              from '@marketplace/domain-module'
import { UpdatePricesRequest }                from '@marketplace/domain-module'
import { UpdateStocksRequest }                from '@marketplace/domain-module'
import { RequestService }                     from '@shared/request-module'

import { YANDEX_MARKET_ADAPTER_CONFIG_TOKEN } from '../config'
import { IYandexMarketAdapterConfig }         from '../config'
import { CampaignIdNotProvidedException }     from '../exceptions'
import { ClientIdNotProvidedException }       from '../exceptions'
import { TokenNotProvidedException }          from '../exceptions'

@Injectable()
export class YandexMarketMarketplaceService extends MarketplaceService {
  #logger: Logger = new Logger(YandexMarketMarketplaceService.name)

  #limit: LimitFunction = pLimit(1)

  constructor(
    @Inject(YANDEX_MARKET_ADAPTER_CONFIG_TOKEN)
    private readonly options: IYandexMarketAdapterConfig,
    private readonly requestService: RequestService
  ) {
    super()
  }

  private buildUrl(path: string) {
    return `${this.options.url}${path.replace('{campaignId}', this.options.campaignId)}`
  }

  private buildHeaders() {
    return {
      'content-type': 'application/json',
      Authorization: `OAuth oauth_token=${this.options.token}, oauth_client_id=${this.options.clientId}`,
    }
  }

  private toAggregate(product: any) {
    return Product.create(
      uuid(),
      product.name,
      product.price,
      product.remains,
      product.shopSku,
      product.code,
      product.description,
      product.vendor,
      product.UOM,
      product.nds,
      product.manufacturerCountries ? product.manufacturerCountries[0] : [],
      product.previewImage,
      product.pictures,
      product.weightDimensions?.width,
      product.weightDimensions?.height,
      product.weightDimensions?.length,
      product.weightDimensions?.weight,
      product.volume,
      product.barcodes,
      product.category
    )
  }

  private toMarketplace(aggregate: Product) {
    return {
      name: aggregate.name,
      weightDimensions: {
        width: aggregate.width,
        height: aggregate.height,
        weight: aggregate.weight,
        length: aggregate.depth,
      },
      urls: [aggregate.imagePreview],
      pictures: aggregate.images,
      price: aggregate.priceWithExtraCharge(),
      manufacturerCountries: [aggregate.country],
      barcodes: aggregate.barcodes || [],
      shopSku: aggregate.articleNumber,
      category: aggregate.category,
      vendor: aggregate.brand,
      vendorCode: aggregate.articleNumber,
      description: aggregate.description,
      remains: aggregate.remains,
    }
  }

  getProducts(): Observable<Array<Product>> {
    this.#logger.info('Called getProducts()')

    assert.ok(this.options.token, new TokenNotProvidedException())
    assert.ok(this.options.clientId, new ClientIdNotProvidedException())
    assert.ok(this.options.campaignId, new CampaignIdNotProvidedException())

    const $productsObservable = new Observable<Array<Product>>((subscriber) => {
      const fetchPage = async (pageToken?: string) => {
        this.#logger.info(`Fetching page ${pageToken}`)

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
            response.result.offerMappingEntries.map(({ offer }) => this.toAggregate(offer))
          )
        }

        if (response.result?.paging.nextPageToken) {
          fetchPage(response.result.paging.nextPageToken)
        } else subscriber.complete()
      }

      fetchPage()
    })

    return $productsObservable
  }

  async createProducts(request: CreateProductsRequest): Promise<void> {
    this.#logger.info('Called createProducts()')

    assert.ok(this.options.token, new TokenNotProvidedException())
    assert.ok(this.options.clientId, new ClientIdNotProvidedException())
    assert.ok(this.options.campaignId, new CampaignIdNotProvidedException())

    const products: Array<object> = []

    for (const product of request.products) {
      products.push({
        offer: this.toMarketplace(product),
      })
    }

    await this.#limit(() =>
      this.requestService.makeRequest(
        this.buildUrl('/campaigns/{campaignId}/offer-mapping-entries/updates'),
        {
          method: 'POST',
          headers: this.buildHeaders(),
          body: JSON.stringify({
            offerMappingEntries: products,
          }),
        }
      ))

    this.#logger.info('Finished createProducts()')
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
                value: Number(product.priceWithExtraCharge()),
              },
            })),
          }),
        }
      ))

    this.#logger.info('Finished updatePrices()')
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
}
