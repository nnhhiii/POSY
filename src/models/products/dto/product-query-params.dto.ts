import { Transform } from 'class-transformer';
import {
  IsOptional,
  IsBoolean,
  IsNumber,
  IsArray,
  IsEnum,
  IsString,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { ProductDiscountType } from '../enums';
import {
  ProductOrderBy,
  ProductQueryParams,
  ProductSortField,
} from '../interfaces';
import { SortDirection } from '../../../common/interfaces';

export class ProductQueryParamsDto {
  @ApiPropertyOptional({ type: String, description: 'Search query' })
  @IsOptional()
  @IsString()
  query?: string;

  @ApiPropertyOptional({ type: Number, description: 'Minimum price' })
  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => parseFloat(value as string))
  priceMin?: number;

  @ApiPropertyOptional({ type: Number, description: 'Maximum price' })
  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => parseFloat(value as string))
  priceMax?: number;

  @ApiPropertyOptional({
    type: [String],
    description: 'Category IDs',
    example: 'categoryId1,categoryId2,categoryId3',
  })
  @IsOptional()
  @IsArray()
  @Transform(({ value }) =>
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    typeof value === 'string' ? value.split(',') : value,
  )
  @IsString({ each: true })
  categoryId?: string[];

  @ApiPropertyOptional({
    type: String,
    enum: ProductDiscountType,
    description: 'Discount type',
  })
  @IsOptional()
  @IsEnum(ProductDiscountType)
  discountType?: ProductDiscountType;

  @ApiPropertyOptional({
    type: Number,
    description: 'Minimum discount value',
  })
  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => parseFloat(value as string))
  discountValueMin?: number;

  @ApiPropertyOptional({
    type: Number,
    description: 'Maximum discount value',
  })
  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => parseFloat(value as string))
  discountValueMax?: number;

  @ApiPropertyOptional({
    type: Number,
    description: 'Minimum stock quantity',
  })
  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => parseInt(value as string))
  stockQuantityMin?: number;

  @ApiPropertyOptional({
    type: Number,
    description: 'Maximum stock quantity',
  })
  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => parseInt(value as string))
  stockQuantityMax?: number;

  @ApiPropertyOptional({ type: Boolean, description: 'Is available' })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  isAvailable?: boolean;

  @ApiPropertyOptional({ type: Boolean, description: 'Is deleted' })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  isDeleted?: boolean;

  @ApiPropertyOptional({ type: Number, description: 'Page number' })
  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => parseInt(value as string))
  page?: number;

  @ApiPropertyOptional({ type: Number, description: 'Page size' })
  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => parseInt(value as string))
  pageSize?: number;

  @ApiPropertyOptional({
    type: String,
    description: `Order by fields in format: field:direction,field:direction. 
    Available fields: price, name, stockQuantity, createdAt, updatedAt`,
    example: 'price:asc,stockQuantity:desc',
  })
  @IsOptional()
  @IsString()
  orderBy?: string;

  toQueryParams(): ProductQueryParams {
    const {
      page,
      pageSize,
      query,
      priceMin,
      priceMax,
      categoryId,
      discountType,
      discountValueMin,
      discountValueMax,
      stockQuantityMin,
      stockQuantityMax,
      isAvailable,
      isDeleted,
      orderBy,
    } = this;

    // Parse orderBy string into ProductOrderBy array
    let parsedOrderBy: ProductOrderBy | undefined;
    if (orderBy) {
      parsedOrderBy = orderBy.split(',').map((item) => {
        const [field, direction] = item.split(':');
        return {
          field: field as ProductSortField,
          direction: direction as SortDirection,
        };
      });
    }

    return {
      page,
      pageSize,
      orderBy: parsedOrderBy,
      filter: {
        query,
        priceMin,
        priceMax,
        categoryId,
        discountType,
        discountValueMin,
        discountValueMax,
        stockQuantityMin,
        stockQuantityMax,
        isAvailable,
        isDeleted,
      },
    };
  }
}
