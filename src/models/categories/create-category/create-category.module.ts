import { Module } from '@nestjs/common';
import { CreateCategoryService } from './create-category.service';

@Module({
  providers: [CreateCategoryService],
  exports: [CreateCategoryService],
})
export class CreateCategoryModule {}
