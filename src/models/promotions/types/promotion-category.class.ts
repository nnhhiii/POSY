import { Promotion } from './promotion.class';
import { Category } from '../../categories/types';

export class PromotionCategory {
  constructor(
    public readonly id: string | null,
    public readonly promotionId: string,
    public readonly categoryId: string,
    public readonly promotion?: Promotion,
    public readonly category?: Category,
  ) {}
}
