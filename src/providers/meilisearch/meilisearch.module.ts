import { Module } from '@nestjs/common';
import { MeilisearchService } from './meilisearch.service';
import { MeilisearchProductService } from './meilisearch-product.service';
import { MeilisearchConfigModule } from '../../config/meilisearch/config.module';

@Module({
  imports: [MeilisearchConfigModule],
  providers: [MeilisearchService, MeilisearchProductService],
  exports: [MeilisearchProductService],
})
export class MeilisearchModule {}
