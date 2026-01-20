import { Promotion } from './promotion.class';
import { Product } from '../../products/types';

export class PromotionProduct {
  constructor(
    public readonly id: string,
    public readonly promotionId: string,
    public readonly productId: string,
    public readonly promotion?: Promotion,
    public readonly product?: Product,
  ) {}
}
