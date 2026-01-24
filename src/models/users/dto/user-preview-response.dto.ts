import { Exclude, Expose } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { Role } from '../../../common/enums';

@Exclude()
export class UserPreviewResponseDto {
  @ApiProperty({
    type: String,
    description: 'User ID',
    example: 'c1a2b3d4-5678-90ab-cdef-1234567890ab',
  })
  @Expose()
  id: string;

  @ApiProperty({ type: String, description: 'Username', example: 'johndoe' })
  @Expose()
  username: string;

  @ApiProperty({ type: String, description: 'Full name', example: 'John Doe' })
  @Expose()
  fullName: string;

  @ApiProperty({
    type: String,
    description: 'Role',
    example: 'STAFF',
    enum: Role,
  })
  @Expose()
  role: string;

  @ApiProperty({ type: Boolean, description: 'Is user active', example: true })
  @Expose()
  isActive: boolean;
}
