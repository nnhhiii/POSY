import { ProductDiscountType } from '../enums';
import { Category } from '../../categories/types';

export class Product {
  constructor(
    public id: string | null,
    public categoryId: string | null,
    public sku: string | null,
    public name: string,
    public description: string | null,
    public price: number,
    public discountType: ProductDiscountType | null,
    public discountValue: number | null,
    public imageUrl: string | null,
    public stockQuantity: number = 0,
    public isAvailable: boolean = true,
    public isDeleted: boolean = false,
    public deletedAt: Date | null,
    public createdAt: Date | null,
    public updatedAt: Date | null,
    public category: Category | undefined,
  ) {}
}
