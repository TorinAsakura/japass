import { Module }                          from '@nestjs/common'

import { MarketplaceApplicationModule }    from '@marketplace/application-module'
import { MarketplaceInfrastructureModule } from '@marketplace/infrastructure-module'
import { MarketplaceJobsAdapterModule }    from '@marketplace/jobs-adapter-module'
import { ActiveJob }                       from '@marketplace/jobs-adapter-module'
import { YandexMarketAdapterModule }       from '@marketplace/yandex-market-adapter-module'
import { CqrsAdapterModule }               from '@shared/cqrs-adapter-module'
import { SharedRequestModule }             from '@shared/request-module'
import { TypeormAdapterModule }            from '@shared/typeorm-adapter-module'

@Module({
  imports: [
    CqrsAdapterModule.register(),
    TypeormAdapterModule.register(),
    MarketplaceInfrastructureModule.register(),
    YandexMarketAdapterModule.register(),
    SharedRequestModule.register(),
    MarketplaceApplicationModule.register(),
    MarketplaceJobsAdapterModule.register({ activeJob: ActiveJob.SYNCHRONIZE_PRODUCTS }),
  ],
})
export class YandexMarketSynchronizerServiceEntrypointModule {}
