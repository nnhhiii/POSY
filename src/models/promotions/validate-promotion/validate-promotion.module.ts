import { Module } from '@nestjs/common';
import { ValidatePromotionService } from './validate-promotion.service';

@Module({
  providers: [ValidatePromotionService],
  exports: [ValidatePromotionService],
})
export class ValidatePromotionModule {}
