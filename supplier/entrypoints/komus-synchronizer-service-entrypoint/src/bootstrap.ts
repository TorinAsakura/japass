import { NestLogger }                               from '@atls/nestjs-logger'
import { NestFactory }                              from '@nestjs/core'

import { KomusSynchronizerServiceEntrypointModule } from './komus-synchronizer-service-entrypoint.module'

declare const module: any

const bootstrap = async () => {
  const app = await NestFactory.create(KomusSynchronizerServiceEntrypointModule, {
    logger: new NestLogger(),
  })

  app.enableShutdownHooks()

  await app.startAllMicroservices()
  await app.listen(3000)

  if (module.hot) {
    module.hot.accept()
    module.hot.dispose(() => app.close())
  }
}

bootstrap()
