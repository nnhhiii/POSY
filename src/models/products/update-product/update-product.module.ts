import { Module } from '@nestjs/common';
import { UpdateProductService } from './update-product.service';

@Module({
  providers: [UpdateProductService],
  exports: [UpdateProductService],
})
export class UpdateProductModule {}
