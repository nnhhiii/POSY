import { IsNotEmpty, IsString, Matches } from 'class-validator';

export class UpdateUserDto {
  @IsString()
  @IsNotEmpty()
  id: string;

  @IsString()
  fullName?: string;

  @IsString()
  @Matches(/(?:\+84|0084|0)[235789][0-9]{1,2}[0-9]{7}(?:\D+|$)/g, {
    message: 'Phone number is not valid.',
  })
  phone?: string;

  @IsString()
  role?: string;
}
