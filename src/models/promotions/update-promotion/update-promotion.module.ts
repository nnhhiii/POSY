import { Module } from '@nestjs/common';
import { UpdatePromotionService } from './update-promotion.service';
import { UpdateExpiredPromotionJobService } from './update-expired-promotion-job.service';

@Module({
  providers: [UpdatePromotionService, UpdateExpiredPromotionJobService],
  exports: [UpdatePromotionService],
})
export class UpdatePromotionModule {}
