import { Test }                       from '@nestjs/testing'

import { PRODUCTS_REPOSITORY_TOKEN }  from '@synchronizer/domain-module'
import { ProductsRepository }         from '@synchronizer/domain-module'
import { RequestService }             from '@synchronizer/request-shared-module'

import { KOMUS_ADAPTER_CONFIG_TOKEN } from '../config'
import { IKomusAdapterConfig }        from '../config'
import { KomusService }               from './komus.service'

describe('synchronizer', () => {
  describe('komus-adapter', () => {
    describe('komus.service', () => {
      let komusService: KomusService
      let komusOptions: IKomusAdapterConfig
      let requestService: RequestService
      let repository: ProductsRepository

      beforeAll(async () => {
        const testingModule = await Test.createTestingModule({
          providers: [
            {
              provide: KOMUS_ADAPTER_CONFIG_TOKEN,
              useValue: {},
            },
            {
              provide: PRODUCTS_REPOSITORY_TOKEN,
              useValue: {},
            },
            {
              provide: RequestService,
              useValue: {},
            },
            KomusService,
          ],
        }).compile()

        komusService = testingModule.get(KomusService)
        komusOptions = testingModule.get(KOMUS_ADAPTER_CONFIG_TOKEN)
        repository = testingModule.get(PRODUCTS_REPOSITORY_TOKEN)
        requestService = testingModule.get(RequestService)
      })

      it('should get all products', async () => {
        const product = { create: jest.fn() }
        let next: number | undefined = 0

        repository.create = jest.fn().mockReturnValue(product)
        komusOptions.token = 'token'
        komusOptions.url = 'url'
        requestService.makeRequest = jest.fn().mockImplementation(() => {
          next! += 1
          if (next === 5) next = undefined

          return new Promise((resolve) => {
            resolve({
              next,
              content: [{}],
            })
          })
        })

        const $observable = komusService.getAllProducts()

        await new Promise((resolve) => {
          $observable.subscribe({
            next: (some) => {
              // do nothing
            },
            complete: () => resolve(undefined),
          })
        })

        expect(requestService.makeRequest).toBeCalled()
      })
    })
  })
})
