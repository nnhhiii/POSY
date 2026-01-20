import { Transform } from 'class-transformer';
import {
  IsOptional,
  IsBoolean,
  IsNumber,
  IsArray,
  IsEnum,
  IsString,
  IsDate,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  PromotionApplicability,
  PromotionDiscountType,
  PromotionStatus,
} from '../enums';
import { PromotionQueryParams } from '../interfaces';

export class PromotionQueryParamsDto {
  @ApiPropertyOptional({ type: String, description: 'Search query' })
  @IsOptional()
  @IsString()
  query?: string;

  @ApiPropertyOptional({
    type: [String],
    enum: PromotionDiscountType,
    description: 'Discount types',
    isArray: true,
  })
  @IsOptional()
  @IsArray()
  @Transform(({ value }) =>
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    typeof value === 'string' ? value.split(',') : value,
  )
  @IsEnum(PromotionDiscountType, { each: true })
  discountType?: PromotionDiscountType[];

  @ApiPropertyOptional({
    type: [String],
    enum: PromotionApplicability,
    description: 'Applicability types',
    isArray: true,
  })
  @IsOptional()
  @IsArray()
  @Transform(({ value }) =>
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    typeof value === 'string' ? value.split(',') : value,
  )
  @IsEnum(PromotionApplicability, { each: true })
  applicability?: PromotionApplicability[];

  @ApiPropertyOptional({
    type: [String],
    enum: PromotionStatus,
    description: 'Promotion statuses',
    isArray: true,
  })
  @IsOptional()
  @IsArray()
  @Transform(({ value }) =>
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    typeof value === 'string' ? value.split(',') : value,
  )
  @IsEnum(PromotionStatus, { each: true })
  status?: PromotionStatus[];

  @ApiPropertyOptional({ type: Boolean, description: 'Is stackable' })
  @IsBoolean()
  isStackable?: boolean;

  @ApiPropertyOptional({ type: Number, description: 'Minimum priority' })
  @IsOptional()
  @IsNumber()
  priorityMin?: number;

  @ApiPropertyOptional({ type: Number, description: 'Maximum priority' })
  @IsOptional()
  @IsNumber()
  priorityMax?: number;

  @ApiPropertyOptional({ type: Boolean, description: 'Is deleted' })
  @IsOptional()
  @IsBoolean()
  isDeleted?: boolean;

  @ApiPropertyOptional({ type: Date, description: 'Start date' })
  @IsOptional()
  @IsDate()
  startDate?: Date;

  @ApiPropertyOptional({ type: Date, description: 'End date' })
  @IsOptional()
  @IsDate()
  endDate?: Date;

  @ApiPropertyOptional({ type: Number, description: 'Page number' })
  @IsOptional()
  @IsNumber()
  page?: number;

  @ApiPropertyOptional({ type: Number, description: 'Page size' })
  @IsOptional()
  @IsNumber()
  pageSize?: number;

  toQueryParams(): PromotionQueryParams {
    const {
      page,
      pageSize,
      query,
      discountType,
      applicability,
      status,
      isStackable,
      priorityMin,
      priorityMax,
      isDeleted,
      startDate,
      endDate,
    } = this;

    return {
      page,
      pageSize,
      filter: {
        query,
        discountType,
        applicability,
        status,
        isStackable,
        priorityMin,
        priorityMax,
        isDeleted,
        startDate,
        endDate,
      },
    };
  }
}
