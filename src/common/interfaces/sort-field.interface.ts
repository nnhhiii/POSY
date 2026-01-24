/** Represents the direction of sorting. 'asc' for ascending order and 'desc' for descending order.*/
export type SortDirection = 'asc' | 'desc';

/**
 * Represents a field and its sort direction for sorting operations.
 *
 * @template T - The type of the field name, typically a string literal union of valid field keys.
 * @property {T} field - The name of the field to sort by.
 * @property {SortDirection} direction - The direction of the sort, either 'asc' for ascending or 'desc' for descending.
 */
export interface SortField<T extends string> {
  field: T;
  direction: SortDirection;
}
