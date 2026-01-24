import { IsNotEmpty, IsString } from 'class-validator';
import { IsValidPassword, Match } from '../../../common/decorators';
import { ApiProperty } from '@nestjs/swagger';

export class UpdatePasswordDto {
  @ApiProperty({
    type: String,
    description: 'User ID',
    example: 'c1a2b3d4-5678-90ab-cdef-1234567890ab',
  })
  @IsString()
  @IsNotEmpty()
  id: string;

  @ApiProperty({
    type: String,
    description: 'New password',
    example: 'StrongPassword123!',
  })
  @IsValidPassword()
  newPassword: string;

  @ApiProperty({
    type: String,
    description: 'Password confirmation',
    example: 'StrongPassword123!',
  })
  @IsString()
  @IsNotEmpty()
  @Match('newPassword', { message: 'Password confirmation does not match' })
  newPasswordConfirmation: string;
}
