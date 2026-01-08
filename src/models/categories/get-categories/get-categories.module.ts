import { Module } from '@nestjs/common';
import { GetCategoriesService } from './get-categories.service';

@Module({
  providers: [GetCategoriesService],
  exports: [GetCategoriesService],
})
export class GetCategoriesModule {}
