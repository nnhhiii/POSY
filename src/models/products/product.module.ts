import { Global, Module } from '@nestjs/common';
import { ProductRepository, ProductRepositoryImpl } from './repositories';

@Global()
@Module({
  providers: [
    {
      provide: ProductRepository,
      useClass: ProductRepositoryImpl,
    },
  ],
  exports: [ProductRepository],
})
export class ProductModule {}
