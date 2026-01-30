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

  @ApiProperty({ type: Boolean, description: 'Has user been deleted', example: true })
  @Expose()
  isDeleted: boolean;

  @ApiProperty({
    type: Date,
    description: 'Lockout expiration time',
    example: '2026-01-24T12:34:56.789Z',
  })
  @Expose()
  lockoutExpiresAt: Date;
}
