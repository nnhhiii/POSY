import { BaseRepository } from '../../../common/interfaces';
import { Promotion, PromotionCategory } from '../types';

export abstract class PromotionCategoryRepository implements BaseRepository<PromotionCategory> {
  abstract create(entity: PromotionCategory): Promise<PromotionCategory>;

  abstract findById(id: string): Promise<PromotionCategory | null>;

  abstract getAll(): Promise<PromotionCategory[]>;

  abstract delete(id: string): Promise<void>;

  abstract getPromotionsByCategoryId(
    categoryId: string,
    includeAll?: boolean,
  ): Promise<Promotion[]>;
}
