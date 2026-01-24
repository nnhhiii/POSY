import { Inject, Injectable } from '@nestjs/common';
import { MeilisearchEngineTemplate } from './templates';
import { MeiliSearchProduct } from './types';
import { MeilisearchService } from './meilisearch.service';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import type { Logger } from 'winston';
import { Product } from '../../models/products/types';
import { MeilisearchProductMapper } from './mappers';
import { ProductQueryFilter } from '../../models/products/interfaces';

@Injectable()
export class MeilisearchProductService extends MeilisearchEngineTemplate<MeiliSearchProduct> {
  constructor(
    meilisearchService: MeilisearchService,
    @Inject(WINSTON_MODULE_NEST_PROVIDER) logger: Logger,
  ) {
    super('products', meilisearchService, logger);
  }

  /**
   * Indexes a single product after converting it to MeiliSearchProduct format.
   */
  async indexProduct(product: Product): Promise<any> {
    const meiliProduct = MeilisearchProductMapper.toMeili(product);
    return this.indexDocument(meiliProduct);
  }

  /**
   * Indexes multiple products after converting them to MeiliSearchProduct format.
   */
  async indexProducts(products: Product[]): Promise<any> {
    const meiliProducts = MeilisearchProductMapper.toMeiliArray(products);
    return this.indexDocuments(meiliProducts);
  }

  /**
   * Builds MeiliSearch filter string from ProductQueryFilter.
   */
  buildFilterString(filter?: ProductQueryFilter): string | undefined {
    if (!filter) return undefined;

    const filters: string[] = [];

    if (filter.priceMin !== undefined) {
      filters.push(`price >= ${filter.priceMin}`);
    }
    if (filter.priceMax !== undefined) {
      filters.push(`price <= ${filter.priceMax}`);
    }
    if (filter.categoryId && filter.categoryId.length > 0) {
      const categoryFilters = filter.categoryId
        .map((id) => `category.id = "${id}"`)
        .join(' OR ');
      filters.push(`(${categoryFilters})`);
    }
    if (filter.discountType) {
      filters.push(`discountType = "${filter.discountType}"`);
    }
    if (filter.discountValueMin !== undefined) {
      filters.push(`discountValue >= ${filter.discountValueMin}`);
    }
    if (filter.discountValueMax !== undefined) {
      filters.push(`discountValue <= ${filter.discountValueMax}`);
    }
    if (filter.isAvailable !== undefined) {
      filters.push(`isAvailable = ${filter.isAvailable}`);
    }
    if (filter.isDeleted !== undefined) {
      filters.push(`isDeleted = ${filter.isDeleted}`);
    }

    return filters.length > 0 ? filters.join(' AND ') : undefined;
  }

  protected getFilterableAttributes(): string[] {
    return [
      'price',
      'discountType',
      'discountValue',
      'isAvailable',
      'isDeleted',
      'category.id',
    ];
  }

  protected getSearchableAttributes(): string[] {
    return ['name', 'category.name'];
  }

  protected getSortableAttributes(): string[] {
    return ['price', 'name', 'stockQuantity', 'createdAt', 'updatedAt'];
  }
}
