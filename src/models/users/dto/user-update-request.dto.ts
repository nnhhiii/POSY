import { IsOptional, IsString } from 'class-validator';
import { IsValidPhoneNumber, IsValidRole } from '../../../common/decorators';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Role } from '../../../common/enums';

export class UpdateUserDto {
  @ApiPropertyOptional({
    type: String,
    description: 'Full name of the user',
    example: 'John Doe',
  })
  @IsOptional()
  @IsString()
  fullName?: string;

  @ApiPropertyOptional({
    type: String,
    description: 'Phone number of the user',
    example: '+1234567890',
  })
  @IsOptional()
  @IsValidPhoneNumber()
  phone?: string;

  @ApiPropertyOptional({
    type: String,
    description: 'Role of the user',
    example: 'STAFF',
    enum: Role,
  })
  @IsOptional()
  @IsValidRole()
  role?: string;
}
