import {
  PromotionApplicability,
  PromotionDiscountType,
  PromotionStatus,
} from '../enums';

export class Promotion {
  constructor(
    public id: string | null,
    public code: string,
    public title: string,
    public description: string | null,
    public discountType: PromotionDiscountType,
    public discountValue: number,
    public maxDiscountAmount: number | null,
    public minOrderValue: number = 0,
    public applicability: PromotionApplicability,
    public minQuantity: number | null,
    public startAt: Date,
    public endAt: Date,
    public usageLimit: number | null,
    public usageCount: number = 0,
    public version: number = 1,
    public status: PromotionStatus,
    public isStackable: boolean = false,
    public priority: number = 0,
    public isDeleted: boolean = false,
    public deletedAt: Date | null,
    public createdAt: Date,
    public updateAt: Date,
  ) {}
}
