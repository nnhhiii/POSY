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

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  username: string;

  @IsValidPassword()
  password: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsValidPhoneNumber()
  phone: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(2, { message: 'The name must be at least 2 characters long.' })
  @MaxLength(100, { message: 'The name must be at most 100 characters long.' })
  fullName: string;

  @IsString()
  @IsValidRole()
  role: string = 'STAFF';

  @IsBoolean()
  isActive: boolean = true;
}
