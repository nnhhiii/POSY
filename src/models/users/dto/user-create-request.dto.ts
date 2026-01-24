import {
  IsBoolean,
  IsEmail,
  IsNotEmpty,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import {
  IsValidPassword,
  IsValidPhoneNumber,
  IsValidRole,
} from '../../../common/decorators';
import { ApiProperty } from '@nestjs/swagger';
import { Role } from '../../../common/enums';

export class CreateUserDto {
  @ApiProperty({
    type: String,
    description: 'Unique username for the user',
    example: 'johndoe',
  })
  @IsString()
  @IsNotEmpty()
  username: string;

  @ApiProperty({
    type: String,
    description: 'Password for the user',
    example: 'StrongPassword123!',
  })
  @IsValidPassword()
  password: string;

  @ApiProperty({
    type: String,
    description: 'Email address of the user',
    example: 'john@example.com',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    type: String,
    description: 'Phone number of the user',
    example: '+1234567890',
  })
  @IsString()
  @IsValidPhoneNumber()
  phone: string;

  @ApiProperty({
    type: String,
    description: 'Full name of the user',
    example: 'John Doe',
    minLength: 2,
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(2, { message: 'fullName must be at least 2 characters long.' })
  @MaxLength(100, { message: 'fullName must be at most 100 characters long.' })
  fullName: string;

  @ApiProperty({
    type: String,
    description: 'Role of the user',
    example: 'STAFF',
    enum: Role,
  })
  @IsString()
  @IsValidRole()
  role: string = 'STAFF';

  @ApiProperty({ type: Boolean, description: 'Is user active', example: true })
  @IsBoolean()
  isActive: boolean = true;
}
