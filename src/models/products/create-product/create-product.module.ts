import { Module } from '@nestjs/common';
import { CreateProductService } from './create-product.service';

@Module({
  providers: [CreateProductService],
  exports: [CreateProductService],
})
export class CreateProductModule {}
