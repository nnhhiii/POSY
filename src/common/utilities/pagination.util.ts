import { Page } from '../interfaces';

export function buildPage<T>(
  items: T[],
  page: number,
  pageSize: number,
  total: number,
): Page<T> {
  return {
    items,
    page,
    pageSize,
    total,
    totalPages: Math.ceil(total / pageSize),
  };
}
