import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SignInDto {
  @ApiProperty({
    type: String,
    description: 'Username for authentication',
    example: 'johndoe',
  })
  @IsString()
  @IsNotEmpty()
  username: string;

  @ApiProperty({
    type: String,
    description: 'Password for authentication',
    example: 'StrongPassword123!',
  })
  @IsString()
  @IsNotEmpty()
  password: string;
}
