import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class CategoryPreviewResponseDto {
  @Expose()
  id: string;

  @Expose()
  name: string;

  @Expose()
  isActive: boolean;

  @Expose()
  slug: string;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;
}
