import { PromotionPreviewResponseDto } from './promotion-preview-response.dto';
import { Exclude, Expose } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

@Exclude()
export class PromotionDetailedResponseDto extends PromotionPreviewResponseDto {
  @ApiProperty({
    type: Number,
    description: 'Maximum discount amount',
    nullable: true,
  })
  @Expose()
  maxDiscountAmount: number | null;

  @ApiProperty({ type: Number, description: 'Minimum order value' })
  @Expose()
  minOrderValue: number;

  @ApiProperty({
    type: Number,
    description: 'Minimum quantity',
    nullable: true,
  })
  @Expose()
  minQuantity: number | null;

  @ApiProperty({
    type: String,
    description: 'Promotion description',
    nullable: true,
  })
  @Expose()
  description: string | null;

  @ApiProperty({ type: Boolean, description: 'Is stackable' })
  @Expose()
  isStackable: boolean;

  @ApiProperty({ type: Number, description: 'Priority' })
  @Expose()
  priority: number;

  @ApiProperty({ type: Number, description: 'Usage limit', nullable: true })
  @Expose()
  usageLimit: number | null;

  @ApiProperty({ type: Number, description: 'Usage count' })
  @Expose()
  usageCount: number;

  @ApiProperty({ type: Number, description: 'Version' })
  @Expose()
  version: number;

  @ApiProperty({ type: Date, description: 'Deleted at', nullable: true })
  @Expose()
  deletedAt: Date | null;
}
