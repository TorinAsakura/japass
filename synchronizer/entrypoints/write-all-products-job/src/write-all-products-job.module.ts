import { Module }                          from '@nestjs/common'

import { CqrsAdapterModule }               from '@synchronizer/cqrs-adapter-module'
import { SynchronizerDomainModule }        from '@synchronizer/domain-module'
import { InfrastructureModule }            from '@synchronizer/infrastructure-module'
import { KomusAdapterModule }              from '@synchronizer/komus-adapter-module'
import { SynchronizerRequestSharedModule } from '@synchronizer/request-shared-module'
import { YandexMarketAdapterModule }       from '@synchronizer/yandex-market-adapter-module'

@Module({
  imports: [
    CqrsAdapterModule.register(),
    InfrastructureModule.register(),
    YandexMarketAdapterModule.register(),
    KomusAdapterModule.register(),
    SynchronizerRequestSharedModule.register(),
    SynchronizerDomainModule.register(),
  ],
})
export class WriteAllProductsJobModule {}
