import { CategoryPreviewResponseDto } from './category-preview-response.dto';
import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class CategoryDetailedResponseDto extends CategoryPreviewResponseDto {
  @Expose()
  description: string;

  // @Expose()
  // createdAt: string;
  //
  // @Expose()
  // updatedAt: string;
}
