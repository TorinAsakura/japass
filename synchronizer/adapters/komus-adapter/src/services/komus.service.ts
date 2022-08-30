import { Injectable }                 from '@nestjs/common'
import { Inject }                     from '@nestjs/common'

import assert                         from 'assert'

import { SupplierPort }               from '@synchronizer/domain-module'
import { SupplierProduct }            from '@synchronizer/domain-module'
import { OperationStack }             from '@synchronizer/domain-module'
import { RequestService }             from '@synchronizer/request-shared-module'

import { KOMUS_ADAPTER_CONFIG_TOKEN } from '../config'
import { IKomusAdapterConfig }        from '../config'
import { TokenNotProvidedException }  from '../exceptions'

@Injectable()
export class KomusService implements SupplierPort {
  constructor(
    @Inject(KOMUS_ADAPTER_CONFIG_TOKEN)
    private readonly komusConfig: IKomusAdapterConfig,
    private readonly requestService: RequestService
  ) {}

  private buildUrl(path: string, requestParams = {}) {
    const stringifiedParams = Object.entries({
      token: this.komusConfig.token,
      ...requestParams,
    }).reduce(
      (string, [key, value], index) => `${string}${index === 0 ? '' : '&'}${key}=${value}`,
      '?'
    )

    return `${this.komusConfig.url}${path}${stringifiedParams}`
  }

  async getAllProducts(): Promise<Array<SupplierProduct>> {
    assert.ok(this.komusConfig.token, new TokenNotProvidedException())

    const fetchedProducts: Array<any> = []
    const fullProducts: Array<any> = []
    const operationStack = new OperationStack()

    const fetchPage = async (page: number) => {
      const requestUrl = this.buildUrl('/api/elements', { format: 'json', count: 250, page })
      const response = await this.requestService.makeRequest(requestUrl)

      fetchedProducts.push(...response.data.content)

      if (response.data.next !== 0) operationStack.push(() => fetchPage(page + 1))
    }

    operationStack.push(() => fetchPage(1))
    await operationStack.waitForAll()

    for (const product of fetchedProducts) {
      operationStack.push(async () => {
        const requestUrl = this.buildUrl(`api/elements/${product.articlenumber}`, {
          format: 'json',
        })
        const response = await this.requestService.makeRequest(requestUrl)
        fullProducts.push(...response.data.content)
      })
    }

    return fullProducts.map((product) => ({
      id: product.id,
      brand: product.brand,
      articleNumber: product.artnumber,
      name: product.name,
      price: product.price,
      remains: product.remains,
      description: product.description,
      attributes: product.Specifications,
      width: product.width,
      height: product.height,
      weight: product.weight,
      depth: product.depth,
      volume: product.volume,
      packagingType: product.packagingType,
      tradeGroup: product.tradeGroup,
      barcodes: product.barcodes.map((b) => b.value),
      imagePreview: product.images,
      images: product.listImages,
      UOM: product.Unit,
      nds: product.nds,
      code: product.code,
    }))
  }
}
