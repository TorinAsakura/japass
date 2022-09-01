import { Test }                       from '@nestjs/testing'

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

      beforeAll(async () => {
        const testingModule = await Test.createTestingModule({
          providers: [
            {
              provide: KOMUS_ADAPTER_CONFIG_TOKEN,
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
        requestService = testingModule.get(RequestService)
      })

      it('should get all products', async () => {
        let next: number | undefined = 1
        let totalPages = 5

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

        await komusService.getAllProducts()

        expect(requestService.makeRequest).toBeCalledTimes(5 * 2)
      })
    })
  })
})
