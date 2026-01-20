import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose, Type } from 'class-transformer';
import { CategoryDetailedResponseDto } from '../../categories/dto';
import { PromotionDetailedResponseDto } from './promotion-detailed-response.dto';

@Exclude()
export class PromotionCategoryDetailedResponseDto {
  @ApiProperty({ type: String, description: 'Promotion category ID' })
  @Expose()
  id: string;

  @ApiProperty({
    type: () => PromotionDetailedResponseDto,
    description: 'Promotion details',
  })
  @Expose()
  @Type(() => PromotionDetailedResponseDto)
  promotion: PromotionDetailedResponseDto;

  @ApiProperty({
    type: () => CategoryDetailedResponseDto,
    description: 'Category details',
  })
  @Expose()
  @Type(() => CategoryDetailedResponseDto)
  category: CategoryDetailedResponseDto;
}
