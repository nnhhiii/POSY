import { Module } from '@nestjs/common';
import { CreatePromotionService } from './create-promotion.service';
import { CategoryModule } from '../../categories/category.module';
import { ProductModule } from '../../products/product.module';

@Module({
  imports: [CategoryModule, ProductModule],
  providers: [CreatePromotionService],
  exports: [CreatePromotionService],
})
export class CreatePromotionModule {}
