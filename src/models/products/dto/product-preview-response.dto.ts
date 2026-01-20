import { Exclude, Expose } from 'class-transformer';
import { ProductDiscountType } from '../enums';
import { CategoryPreviewResponseDto } from '../../categories/dto';

@Exclude()
export class ProductPreviewResponseDto {
  @Expose()
  id: string;

  @Expose()
  name: string;

  @Expose()
  price: number;

  @Expose()
  discountType: ProductDiscountType;

  @Expose()
  discountValue: number;

  @Expose()
  imageUrl: string;

  @Expose()
  isDeleted: boolean;

  @Expose()
  isAvailable: boolean;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;

  @Expose()
  category: CategoryPreviewResponseDto;
}
