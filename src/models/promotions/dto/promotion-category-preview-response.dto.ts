import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose, Type } from 'class-transformer';
import { PromotionPreviewResponseDto } from './promotion-preview-response.dto';
import { CategoryPreviewResponseDto } from '../../categories/dto';

@Exclude()
export class PromotionCategoryPreviewResponseDto {
  @ApiProperty({ type: String, description: 'Promotion category ID' })
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
    type: () => CategoryPreviewResponseDto,
    description: 'Category preview',
  })
  @Expose()
  @Type(() => CategoryPreviewResponseDto)
  category: CategoryPreviewResponseDto;
}
