import { Exclude, Expose } from 'class-transformer';
import { UserPreviewResponseDto } from './user-preview-response.dto';
import { ApiProperty } from '@nestjs/swagger';

@Exclude()
export class UserDetailedResponseDto extends UserPreviewResponseDto {
  @ApiProperty({
    type: String,
    description: 'Email address',
    example: 'john@example.com',
  })
  @Expose()
  email: string;

  @ApiProperty({
    type: String,
    description: 'Phone number',
    example: '+1234567890',
  })
  @Expose()
  phone: string;

  @ApiProperty({
    type: Date,
    description: 'Creation date',
    example: '2026-01-24T12:34:56.789Z',
  })
  @Expose()
  createdAt: Date;

  @ApiProperty({
    type: Date,
    description: 'Last updated date',
    example: '2026-01-24T12:34:56.789Z',
  })
  @Expose()
  updatedAt: Date;
}
