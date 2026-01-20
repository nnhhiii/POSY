import { PaginationParams } from './pagination-params.interface';
import { Page } from './page.interface';

export abstract class BaseRepository<T extends object = any> {
  abstract create(entity: T): Promise<T>;

  abstract findById(id: string): Promise<T | null>;

  abstract delete?(id: string): Promise<void>;

  abstract update?(id: string, entity: Partial<T>): Promise<T>;

  abstract getAll?(params?: PaginationParams): Promise<T[]>;

  abstract getAllPaged?(params?: PaginationParams): Promise<Page<T>>;
}
