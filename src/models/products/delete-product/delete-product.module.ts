import { Module } from '@nestjs/common';
import { DeleteProductService } from './delete-product.service';

@Module({
  providers: [DeleteProductService],
  exports: [DeleteProductService],
})
export class DeleteProductModule {}
