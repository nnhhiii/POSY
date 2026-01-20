/**
 * Represents a field and its sort direction for sorting operations.
 *
 * @template T - The type of the field name, typically a string literal union of valid field keys.
 * @property {T} field - The name of the field to sort by.
 * @property {'asc' | 'desc'} direction - The direction to sort the field, either ascending ('asc') or descending ('desc').
 */
export interface SortField<T extends string> {
  field: T;
  direction: 'asc' | 'desc';
}
