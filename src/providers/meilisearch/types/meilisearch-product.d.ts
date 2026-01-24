import { Product } from '../../../models/products/types';

/**
 * MeiliSearch document type for Product indexing.
 * Optimized for search performance with flattened category structure.
 *
 * Omits internal fields and replaces category with a simplified structure.
 */
export type MeiliSearchProduct = Omit<
  Product,
  'categoryId' | 'sku' | 'description' | 'deletedAt' | 'category'
> & {
  category: { id: string; name: string };
  id: string;
};
