/**
 * Defines a generic structure for paginated API responses.
 * Includes metadata for pagination control and navigation.
 *
 * @template T - The type of items contained in the `data` array.
 */
export interface Page<T> {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}
