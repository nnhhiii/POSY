import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';
import {
  PromotionApplicability,
  PromotionDiscountType,
  PromotionStatus,
} from '../enums';

@Exclude()
export class PromotionPreviewResponseDto {
  @ApiProperty({ type: String, description: 'Promotion ID' })
  @Expose()
  id: string;

  @ApiProperty({ type: String, description: 'Promotion title' })
  @Expose()
  title: string;

  @ApiProperty({ type: String, description: 'Promotion name' })
  @Expose()
  name: string;

  @ApiProperty({ type: String, description: 'Promotion code' })
  @Expose()
  code: string;

  @ApiProperty({ enum: PromotionDiscountType, description: 'Discount type' })
  @Expose()
  discountType: PromotionDiscountType;

  @ApiProperty({ type: Number, description: 'Discount value' })
  @Expose()
  discountValue: number;

  @ApiProperty({
    enum: PromotionApplicability,
    description: 'Promotion applicability',
  })
  @Expose()
  applicability: PromotionApplicability;

  @ApiProperty({ enum: PromotionStatus, description: 'Promotion status' })
  @Expose()
  status: PromotionStatus;

  @ApiProperty({ type: Date, description: 'Promotion start date' })
  @Expose()
  startAt: Date;

  @ApiProperty({ type: Date, description: 'Promotion end date' })
  @Expose()
  endAt: Date;

  @ApiProperty({ type: Boolean, description: 'Is deleted' })
  @Expose()
  isDeleted: boolean;

  @ApiProperty({ type: Date, description: 'Created at' })
  @Expose()
  createdAt: Date;

  @ApiProperty({ type: Date, description: 'Updated at' })
  @Expose()
  updatedAt: Date;
}
