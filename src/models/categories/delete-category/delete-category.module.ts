import { Module } from '@nestjs/common';
import { DeleteCategoryService } from './delete-category.service';

@Module({
  providers: [DeleteCategoryService],
  exports: [DeleteCategoryService],
})
export class DeleteCategoryModule {}
