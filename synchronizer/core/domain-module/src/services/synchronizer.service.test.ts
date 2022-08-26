import { Test }                      from '@nestjs/testing'

import { MARKETPLACE_SERVICE_TOKEN } from '../ports'
import { SUPPLIER_SERVICE_TOKEN }    from '../ports'
import { MarketplacePort }           from '../ports'
import { SupplierPort }              from '../ports'
import { SynchronizerService }       from './synchronizer.service'

describe('synchronizer', () => {
  describe('domain', () => {
    describe('synchronizer.service', () => {
      let synchronizerService: SynchronizerService
      let marketplaceService: MarketplacePort
      let supplierService: SupplierPort

      beforeAll(async () => {
        const testingModule = await Test.createTestingModule({
          providers: [
            SynchronizerService,
            { provide: MARKETPLACE_SERVICE_TOKEN, useValue: {} },
            { provide: SUPPLIER_SERVICE_TOKEN, useValue: {} },
          ],
        }).compile()

        synchronizerService = testingModule.get(SynchronizerService)
        marketplaceService = testingModule.get(MARKETPLACE_SERVICE_TOKEN)
        supplierService = testingModule.get(SUPPLIER_SERVICE_TOKEN)
      })

      it('should synchronize products', async () => {
        marketplaceService.createProducts = jest.fn().mockResolvedValue(undefined)
        supplierService.getAllProducts = jest.fn().mockResolvedValue([{}])

        await synchronizerService.synchronizeProducts()

        expect(marketplaceService.createProducts).toBeCalled()
        expect(supplierService.getAllProducts).toBeCalled()
      })
    })
  })
})
