import { Module } from '@nestjs/common';
import { GetProductsService } from './get-products.service';

@Module({
  providers: [GetProductsService],
  exports: [GetProductsService],
})
export class GetProductsModule {}
