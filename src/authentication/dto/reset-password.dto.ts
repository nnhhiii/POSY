import { IsNotEmpty, IsString } from 'class-validator';
import { IsValidPassword, Match } from '../../common/decorators';
import { ApiProperty } from '@nestjs/swagger';

export class ResetPasswordDto {
  @ApiProperty({
    type: String,
    description: 'Reset token received after code validation',
    example: 'token',
  })
  @IsString()
  @IsNotEmpty()
  token: string;

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
