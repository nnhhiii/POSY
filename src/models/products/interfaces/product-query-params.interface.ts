import { ProductDiscountType } from '../enums';
import { PaginationParams } from '../../../common/interfaces';
import { SortField } from '../../../common/interfaces';

/**
 * Represents the sorting option for product queries.
 *
 * @template T - The allowed field names for sorting.
 * @property {T} field - The field to sort by (e.g., 'price', 'stockQuantity', 'createdAt', 'updatedAt').
 * @property {'asc' | 'desc'} direction - The direction of sorting: ascending ('asc') or descending ('desc').
 */
export type ProductOrderBy = Array<
  SortField<'price' | 'stockQuantity' | 'createdAt' | 'updatedAt'>
>;

/**
 * Represents the filter options available for querying products.
 *
 * @property {string} [query] - Search query string to match product names or descriptions.
 * @property {number} [priceMin] - Minimum price for filtering products.
 * @property {number} [priceMax] - Maximum price for filtering products.
 * @property {string[]} [categoryId] - List of category IDs to filter products by category.
 * @property {ProductDiscountType} [discountType] - Type of discount to filter products.
 * @property {number} [discountValueMin] - Minimum discount value for filtering.
 * @property {number} [discountValueMax] - Maximum discount value for filtering.
 * @property {number} [stockQuantityMin] - Minimum stock quantity for filtering.
 * @property {number} [stockQuantityMax] - Maximum stock quantity for filtering.
 * @property {boolean} [isAvailable] - Whether to filter only available products.
 * @property {boolean} [isDeleted] - Whether to filter only deleted products.
 */
export interface ProductQueryFilter {
  query?: string;
  priceMin?: number;
  priceMax?: number;
  categoryId?: string[];
  discountType?: ProductDiscountType;
  discountValueMin?: number;
  discountValueMax?: number;
  stockQuantityMin?: number;
  stockQuantityMax?: number;
  isAvailable?: boolean;
  isDeleted?: boolean;
}

/**
 * Parameters for querying products with pagination, filtering, and sorting.
 *
 * @property {number} [page] - The page number to retrieve (from PaginationParams).
 * @property {number} [pageSize] - The number of items per page (from PaginationParams).
 * @property {ProductOrderBy} [orderBy] - Array of sorting options for specific fields and direction.
 * @property {ProductQueryFilter} [filter] - Filtering options for products.
 */
export interface ProductQueryParms extends PaginationParams {
  /**
   * Specifies sorting options for the query. Each object in the array defines a field to sort by and the direction.
   *
   * @Example
   *   orderBy: [
   *     { field: 'price', direction: 'asc' },
   *     { field: 'stockQuantity', direction: 'desc' }
   *   ]
   */
  orderBy?: ProductOrderBy;

  filter?: ProductQueryFilter;
}
