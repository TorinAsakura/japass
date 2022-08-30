import { Module }                          from '@nestjs/common'

import { SynchronizerDomainModule }        from '@synchronizer/domain-module'
import { KomusAdapterModule }              from '@synchronizer/komus-adapter-module'
import { SynchronizerRequestSharedModule } from '@synchronizer/request-shared-module'
import { YandexMarketAdapterModule }       from '@synchronizer/yandex-market-adapter-module'

@Module({
  imports: [
    YandexMarketAdapterModule.register(),
    KomusAdapterModule.register(),
    SynchronizerRequestSharedModule.register(),
    SynchronizerDomainModule.register(),
  ],
})
export class SynchronizerServiceEntrypointModule {}
