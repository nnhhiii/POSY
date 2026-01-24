import { PaginationParams } from '../../../common/interfaces';
import { SortField } from '../../../common/interfaces';

export type UserSortField =
  | 'fullName'
  | 'email'
  | 'username'
  | 'role'
  | 'createdAt'
  | 'updatedAt';

/**
 * Represents the sorting option for user queries.
 *
 * @template T - The allowed field names for sorting.
 * @property {T} field - The field to sort by (e.g., 'fullName', 'email', 'username', 'role', 'createdAt', 'updatedAt').
 * @property {'asc' | 'desc'} direction - The direction of sorting: ascending ('asc') or descending ('desc').
 */
export type UserOrderBy = Array<SortField<UserSortField>>;

/**
 * Represents the filter options available for querying users.
 *
 * @property {string} [query] - Search query string to match user full name, email, or username.
 * @property {string} [role] - Filter by user role (ADMIN, MANAGER, CASHIER).
 * @property {boolean} [isActive] - Whether to filter only active users.
 * @property {boolean} [isDeleted] - Whether to filter only deleted users.
 */
export interface UserQueryFilter {
  query?: string;
  role?: string;
  isActive?: boolean;
  isDeleted?: boolean;
}

/**
 * Parameters for querying users with pagination, filtering, and sorting.
 *
 * @property {number} [page] - The page number to retrieve (from PaginationParams).
 * @property {number} [pageSize] - The number of items per page (from PaginationParams).
 * @property {UserOrderBy} [orderBy] - Array of sorting options for specific fields and direction.
 * @property {UserQueryFilter} [filter] - Filtering options for users.
 */
export interface UserQueryParams extends PaginationParams {
  /**
   * Specifies sorting options for the query. Each object in the array defines a field to sort by and the direction.
   *
   * @Example
   *   orderBy: [
   *     { field: 'fullName', direction: 'asc' },
   *     { field: 'createdAt', direction: 'desc' }
   *   ]
   */
  orderBy?: UserOrderBy;

  filter?: UserQueryFilter;
}
