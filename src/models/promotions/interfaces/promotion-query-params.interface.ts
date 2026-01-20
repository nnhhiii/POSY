import { PaginationParams } from '../../../common/interfaces';
import {
  PromotionApplicability,
  PromotionDiscountType,
  PromotionStatus,
} from '../enums';

export interface PromotionQueryFilters {
  /** Blind search query for code, title, or description */
  query?: string;
  discountType?: PromotionDiscountType[];
  applicability?: PromotionApplicability[];
  status?: PromotionStatus[];
  isStackable?: boolean;
  priorityMin?: number;
  priorityMax?: number;
  isDeleted?: boolean;
  startDate?: Date;
  endDate?: Date;
}

export interface PromotionQueryParams extends PaginationParams {
  filter?: PromotionQueryFilters;
}
