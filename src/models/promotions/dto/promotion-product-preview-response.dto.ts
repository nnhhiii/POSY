import { Exclude, Expose, Type } from 'class-transformer';
import { PromotionPreviewResponseDto } from './promotion-preview-response.dto';
import { ProductPreviewResponseDto } from '../../products/dto';
import { ApiProperty } from '@nestjs/swagger';

@Exclude()
export class PromotionProductPreviewResponseDto {
  @ApiProperty({ type: String, description: 'Promotion product ID' })
  @Expose()
  id: string;

  @ApiProperty({
    type: () => PromotionPreviewResponseDto,
    description: 'Promotion preview',
  })
  @Expose()
  @Type(() => PromotionPreviewResponseDto)
  promotion: PromotionPreviewResponseDto;

  @ApiProperty({
    type: () => ProductPreviewResponseDto,
    description: 'Product preview',
  })
  @Expose()
  @Type(() => ProductPreviewResponseDto)
  product: ProductPreviewResponseDto;
}
