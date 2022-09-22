import { NestLogger }                from '@atls/nestjs-logger'
import { NestFactory }               from '@nestjs/core'

import { SynchronizerService }       from '@synchronizer/domain-module'

import { WriteAllProductsJobModule } from './write-all-products-job.module'

const bootstrap = async () => {
  const app = await NestFactory.create(WriteAllProductsJobModule, {
    logger: new NestLogger(),
  })

  await app.init()
  await app.get(SynchronizerService).writeProducts()
}

bootstrap()
