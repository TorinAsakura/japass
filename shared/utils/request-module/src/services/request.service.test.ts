import { Test }                        from '@nestjs/testing'

import { SHARED_REQUEST_CONFIG_TOKEN } from '../config'
import { ISharedRequestConfig }        from '../config'
import { RequestService }              from './request.service'

describe('synchronizer', () => {
  describe('shared', () => {
    describe('request.service', () => {
      let requestService: RequestService
      let options: ISharedRequestConfig

      beforeAll(async () => {
        const testingModule = await Test.createTestingModule({
          providers: [
            {
              provide: SHARED_REQUEST_CONFIG_TOKEN,
              useValue: {},
            },
            RequestService,
          ],
        }).compile()

        requestService = testingModule.get(RequestService)
        options = testingModule.get(SHARED_REQUEST_CONFIG_TOKEN)
      })

      it('should make request', async () => {
        options.fetch = jest
          .fn()
          .mockResolvedValue({ json: jest.fn().mockResolvedValue({ data: { id: 1 } }) })
        options.timeoutOnFailure = 500

        const response = await requestService.makeRequest('someurl')

        expect(options.fetch).toBeCalled()
        expect(response.data.id).toBeDefined()
      })

      it('should rerun request on failure', async () => {
        let called = 0

        options.fetch = jest.fn().mockImplementation(() => {
          called += 1
          jest.fn().mockRejectedValue('no resolve')
        })
        options.timeoutOnFailure = 500

        setTimeout(() => {
          options.fetch = jest
            .fn()
            .mockResolvedValue({ json: jest.fn().mockResolvedValue({ data: { id: 1 } }) })
        }, 1500)

        const response = await requestService.makeRequest('someurl')

        expect(called).toBeGreaterThan(1)
        expect(response.data.id).toBeDefined()
      })
    })
  })
})
