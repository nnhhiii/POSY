import { Module } from '@nestjs/common';
import { DeletePromotionService } from './delete-promotion.service';

@Module({
  providers: [DeletePromotionService],
  exports: [DeletePromotionService],
})
export class DeletePromotionModule {}
