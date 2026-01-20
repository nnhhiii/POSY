import {
  IsBoolean,
  IsDate,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsEnum,
  Min,
} from 'class-validator';
import {
  PromotionApplicability,
  PromotionDiscountType,
  PromotionStatus,
} from '../enums';
import {
  IsValidDescription,
  IsValidDiscountValue,
  IsValidTitle,
} from '../decorators';
import { IsAfter } from '../../../common/decorators';
import { promotionConfig } from '../promotion.config';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

const minQuantityConstraint = promotionConfig.minQuantity.constraint;

export class CreatePromotionDto {
  @ApiPropertyOptional({
    type: String,
    description: 'Promotion ID (optional, usually auto-generated)',
  })
  @IsOptional()
  @IsString()
  id?: string;

  @ApiProperty({
    type: String,
    description: 'Promotion code',
    example: 'SUMMER2024',
  })
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiProperty({
    type: String,
    description: 'Promotion title',
    example: 'Summer Sale',
  })
  @IsValidTitle()
  title: string;

  @ApiPropertyOptional({ type: String, description: 'Promotion description' })
  @IsOptional()
  @IsValidDescription()
  description?: string;

  @ApiProperty({ enum: PromotionDiscountType, description: 'Discount type' })
  @IsEnum(PromotionDiscountType)
  discountType: PromotionDiscountType;

  @ApiProperty({ type: Number, description: 'Discount value' })
  @IsValidDiscountValue()
  discountValue: number;

  @ApiPropertyOptional({
    type: Number,
    description: 'Maximum discount amount',
  })
  @IsOptional()
  @IsNumber()
  maxDiscountAmount?: number;

  @ApiPropertyOptional({ type: Number, description: 'Minimum order value' })
  @IsOptional()
  @IsNumber()
  minOrderValue?: number;

  @ApiProperty({
    enum: PromotionApplicability,
    description: 'Promotion applicability',
  })
  @IsEnum(PromotionApplicability)
  applicability: PromotionApplicability;

  @ApiPropertyOptional({ type: Number, description: 'Minimum quantity' })
  @IsOptional()
  @IsNumber()
  @Min(minQuantityConstraint.min, {
    message: minQuantityConstraint.message.min,
  })
  minQuantity?: number;

  @ApiProperty({ type: Date, description: 'Promotion start date' })
  @IsDate()
  @IsNotEmpty()
  startAt: Date;

  @ApiProperty({ type: Date, description: 'Promotion end date' })
  @IsDate()
  @IsNotEmpty()
  @IsAfter('startAt')
  endAt: Date;

  @ApiPropertyOptional({ type: Number, description: 'Usage limit' })
  @IsOptional()
  @IsNumber()
  usageLimit?: number;

  @ApiPropertyOptional({ type: Number, description: 'Usage count' })
  @IsOptional()
  @IsNumber()
  usageCount?: number;

  @ApiPropertyOptional({ type: Number, description: 'Version' })
  @IsOptional()
  @IsNumber()
  version?: number;

  @ApiPropertyOptional({
    enum: PromotionStatus,
    description: 'Promotion status',
  })
  @IsEnum(PromotionStatus)
  @IsOptional()
  status?: PromotionStatus;

  @ApiPropertyOptional({ type: Boolean, description: 'Is stackable' })
  @IsOptional()
  @IsBoolean()
  isStackable?: boolean;

  @ApiPropertyOptional({ type: Number, description: 'Priority' })
  @IsOptional()
  @IsNumber()
  priority?: number;

  @ApiPropertyOptional({ type: Date, description: 'Created at' })
  @IsOptional()
  @IsDate()
  createdAt?: Date;

  @ApiPropertyOptional({ type: Date, description: 'Updated at' })
  @IsOptional()
  @IsDate()
  updatedAt?: Date;
}
