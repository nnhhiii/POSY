import {
  IsUUID,
  IsString,
  IsOptional,
  IsNumber,
  IsArray,
  IsBoolean,
  Min,
} from 'class-validator';

export class UpdateProductDto {
  @IsUUID()
  id: string;

  @IsOptional()
  @IsUUID()
  category_id?: string;

  @IsOptional()
  @IsString()
  sku?: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  price?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  discount_price?: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  image_url?: string[];

  @IsOptional()
  @IsBoolean()
  is_available?: boolean;
}
