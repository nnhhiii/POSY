import { IsOptional, IsString } from 'class-validator';
import { IsValidPhoneNumber, IsValidRole } from '../../../common/decorators';

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  fullName?: string;

  @IsOptional()
  @IsValidPhoneNumber()
  phone?: string;

  @IsOptional()
  @IsValidRole()
  role?: string;
}
