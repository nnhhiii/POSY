import { Module } from '@nestjs/common';
import { UpdateCategoryService } from './update-category.service';

@Module({
  providers: [UpdateCategoryService],
  exports: [UpdateCategoryService],
})
export class UpdateCategoryModule {}
