import { Test }                         from '@nestjs/testing'

import { RequestService }               from '@synchronizer/shared-module'

import { KOMUS_ADAPTER_MODULE_OPTIONS } from '../module'
import { IKomusAdapterModuleOptions }   from '../module'
import { KomusService }                 from './komus.service'

describe('synchronizer', () => {
  describe('komus-adapter', () => {
    describe('komus.service', () => {
      let komusService: KomusService
      let komusOptions: IKomusAdapterModuleOptions
      let requestService: RequestService

      beforeAll(async () => {
        const testingModule = await Test.createTestingModule({
          providers: [
            {
              provide: KOMUS_ADAPTER_MODULE_OPTIONS,
              useValue: {},
            },
            RequestService,
            KomusService,
          ],
        }).compile()

        komusService = testingModule.get(KomusService)
        komusOptions = testingModule.get(KOMUS_ADAPTER_MODULE_OPTIONS)
        requestService = testingModule.get(RequestService)
      })

      it('should get all products', async () => {
        let next = 5

        komusOptions.token = 'token'
        komusOptions.url = 'url'
        requestService.makeRequest = jest.fn().mockImplementation(() => {
          next -= 1

          return jest.fn().mockResolvedValue({
            json: jest.fn().mockResolvedValue({
              data: {
                next,
                content: [{}],
              },
            }),
          })
        })

        await komusService.getAllProducts()

        expect(requestService.makeRequest).toBeCalledTimes(5 * 2)
      })
    })
  })
})
