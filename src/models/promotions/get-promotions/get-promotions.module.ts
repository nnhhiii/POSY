import { Module } from '@nestjs/common';
import { GetPromotionsService } from './get-promotions.service';

@Module({
  providers: [GetPromotionsService],
  exports: [GetPromotionsService],
})
export class GetPromotionsModule {}
