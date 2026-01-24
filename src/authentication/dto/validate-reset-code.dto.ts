import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ValidateResetCodeDto {
  @ApiProperty({
    type: String,
    description: 'Email address for password reset',
    example: 'john@example.com',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    type: String,
    description: 'Reset code sent to user email',
    example: '123456',
  })
  @IsString()
  @IsNotEmpty()
  resetCode: string;
}
