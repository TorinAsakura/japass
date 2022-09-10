import { Test }                      from '@nestjs/testing'

import { Observable }                from 'rxjs'

import { MARKETPLACE_SERVICE_TOKEN } from '../ports'
import { SUPPLIER_SERVICE_TOKEN }    from '../ports'
import { MarketplacePort }           from '../ports'
import { SupplierPort }              from '../ports'
import { PRODUCTS_REPOSITORY_TOKEN } from '../repositories'
import { ProductsRepository }        from '../repositories'
import { SynchronizerService }       from './synchronizer.service'

describe('synchronizer', () => {
  describe('domain', () => {
    describe('synchronizer.service', () => {
      let synchronizerService: SynchronizerService
      let marketplaceService: MarketplacePort
      let supplierService: SupplierPort
      let repository: ProductsRepository

      beforeAll(async () => {
        const testingModule = await Test.createTestingModule({
          providers: [
            SynchronizerService,
            { provide: MARKETPLACE_SERVICE_TOKEN, useValue: {} },
            { provide: SUPPLIER_SERVICE_TOKEN, useValue: {} },
            { provide: PRODUCTS_REPOSITORY_TOKEN, useValue: {} },
          ],
        }).compile()

        synchronizerService = testingModule.get(SynchronizerService)
        marketplaceService = testingModule.get(MARKETPLACE_SERVICE_TOKEN)
        supplierService = testingModule.get(SUPPLIER_SERVICE_TOKEN)
        repository = testingModule.get(PRODUCTS_REPOSITORY_TOKEN)
      })

      it('should write products', async () => {
        marketplaceService.createProducts = jest.fn().mockResolvedValue(undefined)
        supplierService.getAllProducts = jest.fn().mockReturnValue(
          new Observable((subscriber) => {
            subscriber.next({})
            subscriber.complete()
          })
        )
        repository.findAll = jest.fn().mockResolvedValue({ products: [], hasNextPage: false })
        repository.save = jest.fn().mockResolvedValue(undefined)

        await synchronizerService.writeProducts()

        expect(supplierService.getAllProducts).toBeCalled()
      })

      it('should sync products with db', async () => {
        repository.findAll = jest.fn().mockResolvedValue({ products: [], hasNextPage: false })
        repository.save = jest.fn().mockResolvedValue(undefined)

        await synchronizerService.synchronizeProductsWithDb()

        expect(repository.findAll).toBeCalled()
      })

      it('should sync products with marketplace', async () => {
        repository.findAll = jest.fn().mockResolvedValue({ products: [], hasNextPage: false })
        repository.save = jest.fn().mockResolvedValue(undefined)

        await synchronizerService.synchronizeProductsWithDb()

        expect(repository.findAll).toBeCalled()
      })
    })
  })
})
