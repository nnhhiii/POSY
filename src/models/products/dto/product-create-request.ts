import {
  IsUUID,
  IsString,
  IsOptional,
  IsNumber,
  IsBoolean,
  IsEnum,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ProductDiscountType } from '../enums';

export class CreateProductDto {
  @ApiPropertyOptional({
    type: String,
    description: 'Category ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsOptional()
  @IsUUID()
  categoryId?: string;

  @ApiPropertyOptional({
    type: String,
    description: 'Product SKU',
    example: 'PROD-001',
  })
  @IsOptional()
  @IsString()
  sku?: string;

  @ApiProperty({
    type: String,
    description: 'Product name',
    example: 'Premium Coffee Beans',
  })
  @IsString()
  name: string;

  @ApiPropertyOptional({
    type: String,
    description: 'Product description',
    example: 'High-quality Arabica coffee beans from Colombia',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    type: Number,
    description: 'Product price',
    example: 29.99,
    minimum: 0,
  })
  @IsNumber()
  @Min(0)
  price: number;

  @ApiPropertyOptional({
    enum: ProductDiscountType,
    description: 'Discount type',
    example: ProductDiscountType.PERCENTAGE,
  })
  @IsOptional()
  @IsEnum(ProductDiscountType)
  discountType?: ProductDiscountType;

  @ApiPropertyOptional({
    type: Number,
    description: 'Discount value',
    example: 10,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  discountValue?: number;

  @ApiPropertyOptional({
    type: String,
    description: 'Product image URL',
    example: 'https://example.com/images/product.jpg',
  })
  @IsOptional()
  @IsString()
  imageUrl?: string;

  @ApiPropertyOptional({
    type: Number,
    description: 'Stock quantity',
    example: 100,
    minimum: 0,
    default: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  stockQuantity?: number;

  @ApiPropertyOptional({
    type: Boolean,
    description: 'Is product available for purchase',
    example: true,
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  isAvailable?: boolean;
}
