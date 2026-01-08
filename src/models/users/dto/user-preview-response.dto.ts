import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class UserPreviewResponseDto {
  @Expose()
  id: string;

  @Expose()
  username: string;

  @Expose()
  fullName: string;

  @Expose()
  role: string;

  @Expose()
  isActive: boolean;
}
