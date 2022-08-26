import { Test }                    from '@nestjs/testing'

import { REQUEST_SERVICE_OPTIONS } from '../module'
import { IRequestServiceOptions }  from '../module'
import { RequestService }          from './request.service'

describe('synchronizer', () => {
  describe('shared', () => {
    describe('request.service', () => {
      let requestService: RequestService
      let options: IRequestServiceOptions

      beforeAll(async () => {
        const testingModule = await Test.createTestingModule({
          providers: [
            {
              provide: REQUEST_SERVICE_OPTIONS,
              useValue: {},
            },
            RequestService,
          ],
        }).compile()

        requestService = testingModule.get(RequestService)
        options = testingModule.get(REQUEST_SERVICE_OPTIONS)
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
