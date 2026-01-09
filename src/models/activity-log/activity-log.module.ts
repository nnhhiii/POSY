import { Module } from '@nestjs/common';
import {
  ActivityLogRepositoryImpl,
  ActivityLogRepository,
} from './repositories';
import { ActivityLogGateway } from './activity-log.gateway';
import { TokenGeneratorsModule } from '../../authentication/common/token-generators/token-generators.module';
import { ActivityLogController } from './activity-log.controller';
import { ActivityLogService } from './activity-log.service';

@Module({
  imports: [TokenGeneratorsModule],
  providers: [
    {
      provide: ActivityLogRepository,
      useClass: ActivityLogRepositoryImpl,
    },
    ActivityLogGateway,
    ActivityLogService,
  ],
  exports: [ActivityLogRepository, ActivityLogGateway],
  controllers: [ActivityLogController],
})
export class ActivityLogModule {}
