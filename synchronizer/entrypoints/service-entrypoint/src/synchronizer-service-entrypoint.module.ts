import { Module }                          from '@nestjs/common'

import { SynchronizerApplicationModule }   from '@synchronizer/application-module'
import { CqrsAdapterModule }               from '@synchronizer/cqrs-adapter-module'
import { SynchronizerDomainModule }        from '@synchronizer/domain-module'
import { YandexMarketAdapterModule }       from '@synchronizer/yandex-market-adapter-module'
import { SynchronizerRequestSharedModule } from '@synchronizer/request-shared-module'
import { InfrastructureModule }            from '@synchronizer/infrastructure-module'
import { KomusAdapterModule }              from '@synchronizer/komus-adapter-module'

@Module({
  imports: [
    CqrsAdapterModule.register(),
    InfrastructureModule.register(),
    YandexMarketAdapterModule.register(),
    KomusAdapterModule.register(),
    SynchronizerRequestSharedModule.register(),
    SynchronizerDomainModule.register(),
    SynchronizerApplicationModule.register(),
  ],
})
export class SynchronizerServiceEntrypointModule {}
