import { Module }                          from '@nestjs/common'

import { SynchronizerApplicationModule }   from '@synchronizer/application-module'
import { Job }                             from '@synchronizer/application-module'
import { CqrsAdapterModule }               from '@synchronizer/cqrs-adapter-module'
import { SynchronizerDomainModule }        from '@synchronizer/domain-module'
import { InfrastructureModule }            from '@synchronizer/infrastructure-module'
import { KomusAdapterModule }              from '@synchronizer/komus-adapter-module'
import { YandexMarketAdapterModule }       from '@synchronizer/yandex-market-adapter-module'
import { SynchronizerRequestSharedModule } from '@synchronizer/request-shared-module'

@Module({
  imports: [
    CqrsAdapterModule.register(),
    InfrastructureModule.register(),
    YandexMarketAdapterModule.register(),
    KomusAdapterModule.register(),
    SynchronizerRequestSharedModule.register(),
    SynchronizerDomainModule.register(),
    SynchronizerApplicationModule.register({ job: Job.WRITER }),
  ],
})
export class WriterServiceEntrypointModule {}
