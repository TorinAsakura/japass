import { DynamicModule }  from '@nestjs/common'
import { Module }         from '@nestjs/common'
import { ScheduleModule } from '@nestjs/schedule'

@Module({})
export class ScheduleAdapterModule {
  static register(): DynamicModule {
    return {
      global: true,
      module: ScheduleAdapterModule,
      imports: [ScheduleModule.forRoot()],
      exports: [ScheduleModule.forRoot()],
    }
  }
}
