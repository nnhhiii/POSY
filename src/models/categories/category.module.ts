import { Global, Module } from '@nestjs/common';
import { CategoryController } from './category.controller';
import { PrismaModule } from 'src/providers/prisma/prisma.module';
import { CreateCategoryModule } from './create-category/create-category.module';
import { UpdateCategoryModule } from './update-category/update-category.module';
import { DeleteCategoryModule } from './delete-category/delete-category.module';
import { CategoryRepository, CategoryRepositoryImpl } from './repositories';
import { GetCategoriesModule } from './get-categories/get-categories.module';

@Global()
@Module({
  providers: [
    {
      provide: CategoryRepository,
      useClass: CategoryRepositoryImpl,
    },
  ],
  imports: [
    PrismaModule,
    CreateCategoryModule,
    UpdateCategoryModule,
    DeleteCategoryModule,
    GetCategoriesModule,
  ],
  controllers: [CategoryController],
  exports: [CategoryRepository],
})
export class CategoryModule {}
