import { Module }                       from '@nestjs/common'

import { CqrsAdapterModule }            from '@shared/cqrs-adapter-module'
import { SharedRequestModule }          from '@shared/request-module'
import { TypeormAdapterModule }         from '@shared/typeorm-adapter-module'
import { SupplierApplicationModule }    from '@supplier/application-module'
import { SupplierInfrastructureModule } from '@supplier/infrastructure-module'
import { SupplierJobsAdapterModule }    from '@supplier/jobs-adapter-module'
import { ActiveJob }                    from '@supplier/jobs-adapter-module'
import { KomusAdapterModule }           from '@supplier/komus-adapter-module'

@Module({
  imports: [
    CqrsAdapterModule.register(),
    TypeormAdapterModule.register(),
    SupplierInfrastructureModule.register(),
    KomusAdapterModule.register(),
    SharedRequestModule.register(),
    SupplierApplicationModule.register(),
    SupplierJobsAdapterModule.register({ activeJob: ActiveJob.SYNCHRONIZE_PRODUCTS }),
  ],
})
export class KomusSynchronizerServiceEntrypointModule {}
