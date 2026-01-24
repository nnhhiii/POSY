import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose, Type } from 'class-transformer';
import { ProductDiscountType } from '../enums';
import { CategoryDetailedResponseDto } from '../../categories/dto';

@Exclude()
export class ProductDetailedResponseDto {
  @ApiProperty({ type: String, description: 'Product ID' })
  @Expose()
  id: string;

  @ApiProperty({ type: String, description: 'Category ID', nullable: true })
  @Expose()
  categoryId: string;

  @ApiProperty({ type: String, description: 'Product SKU', nullable: true })
  @Expose()
  sku: string;

  @ApiProperty({ type: String, description: 'Product name' })
  @Expose()
  name: string;

  @ApiProperty({
    type: String,
    description: 'Product description',
    nullable: true,
  })
  @Expose()
  description: string;

  @ApiProperty({ type: Number, description: 'Product price' })
  @Expose()
  price: number;

  @ApiProperty({ enum: ProductDiscountType, description: 'Discount type' })
  @Expose()
  discountType: ProductDiscountType;

  @ApiProperty({ type: Number, description: 'Discount value' })
  @Expose()
  discountValue: number;

  @ApiProperty({ type: String, description: 'Product image URLs' })
  @Expose()
  imageUrl: string;

  @ApiProperty({ type: Number, description: 'Stock quantity' })
  @Expose()
  stockQuantity: number;

  @ApiProperty({ type: Boolean, description: 'Is deleted' })
  @Expose()
  isDeleted: boolean;

  @ApiProperty({ type: Boolean, description: 'Is available' })
  @Expose()
  isAvailable: boolean;

  @ApiProperty({ type: Date, description: 'Created at' })
  @Expose()
  createdAt: Date;

  @ApiProperty({ type: Date, description: 'Updated at' })
  @Expose()
  updatedAt: Date;

  @ApiProperty({ type: Date, description: 'Deleted at', nullable: true })
  @Expose()
  deletedAt: Date;

  @ApiProperty({
    type: () => CategoryDetailedResponseDto,
    description: 'Product category',
  })
  @Expose()
  @Type(() => CategoryDetailedResponseDto)
  category: CategoryDetailedResponseDto;
}
