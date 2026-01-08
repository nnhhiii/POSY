import { Exclude, Expose } from 'class-transformer';
import { UserPreviewResponseDto } from './user-preview-response.dto';

@Exclude()
export class UserDetailedResponseDto extends UserPreviewResponseDto {
  @Expose()
  email: string;

  @Expose()
  phone: string;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;
}
