import { Test }                               from '@nestjs/testing'

import { RequestService }                     from '@synchronizer/request-shared-module'

import { YANDEX_MARKET_ADAPTER_CONFIG_TOKEN } from '../config'
import { IYandexMarketAdapterConfig }         from '../config'
import { YandexMarketService }                from './yandex-market.service'

describe('synchronizer', () => {
  describe('yandex-market-adapter', () => {
    describe('yandex-market.service', () => {
      let yandexMarketService: YandexMarketService
      let yandexMarketAdapterConfig: IYandexMarketAdapterConfig
      let requestService: RequestService

      beforeAll(async () => {
        const testingModule = await Test.createTestingModule({
          providers: [
            {
              provide: YANDEX_MARKET_ADAPTER_CONFIG_TOKEN,
              useValue: {},
            },
            {
              provide: RequestService,
              useValue: {},
            },
            YandexMarketService,
          ],
        }).compile()

        yandexMarketService = testingModule.get(YandexMarketService)
        yandexMarketAdapterConfig = testingModule.get(YANDEX_MARKET_ADAPTER_CONFIG_TOKEN)
        requestService = testingModule.get(RequestService)
      })

      it('should get all products', async () => {
        yandexMarketAdapterConfig.token = 'token'
        yandexMarketAdapterConfig.url = 'url'
        yandexMarketAdapterConfig.clientId = 'clientId'
        yandexMarketAdapterConfig.campaignId = 'campaignId'
        requestService.makeRequest = jest.fn().mockImplementation(
          () =>
            new Promise((resolve) => {
              resolve({
                data: {},
              })
            })
        )

        await yandexMarketService.createProducts({
          products: [
            {
              name: 'string',
              articleNumber: 'string',
              category: 'string',
              manufacturer: 'string',
              length: 1,
              width: 1,
              height: 1,
              weight: 1,
              previewImage: 'string',
              pictures: ['string'],
              vendor: 'string',
              vendorCode: 'string',
              barcodes: ['string'],
              description: 'string',
              quantumOfSupply: 1,
            },
          ],
        })

        expect(requestService.makeRequest).toBeCalledTimes(1)
      })
    })
  })
})
