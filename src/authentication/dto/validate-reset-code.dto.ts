import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class ValidateResetCodeDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  resetCode: string;
}
