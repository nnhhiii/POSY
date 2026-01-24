import { Global, Module } from '@nestjs/common';
import { ProductController } from './product.controller';
import { ProductRepository, ProductRepositoryImpl } from './repositories';
import { CreateProductModule } from './create-product/create-product.module';
import { UpdateProductModule } from './update-product/update-product.module';
import { GetProductsModule } from './get-products/get-products.module';
import { DeleteProductModule } from './delete-product/delete-product.module';
import { MeilisearchModule } from '../../providers/meilisearch/meilisearch.module';

@Global()
@Module({
  providers: [
    {
      provide: ProductRepository,
      useClass: ProductRepositoryImpl,
    },
  ],
  exports: [ProductRepository],
  imports: [
    CreateProductModule,
    UpdateProductModule,
    GetProductsModule,
    DeleteProductModule,
    MeilisearchModule,
  ],
  controllers: [ProductController],
})
export class ProductModule {}
