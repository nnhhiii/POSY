import { IsNotEmpty, IsString } from 'class-validator';
import { IsValidPassword, Match } from '../../../common/decorators';

export class UpdatePasswordDto {
  @IsString()
  @IsNotEmpty()
  id: string;

  @IsValidPassword()
  newPassword: string;

  @IsString()
  @IsNotEmpty()
  @Match('newPassword', { message: 'Password confirmation does not match' })
  newPasswordConfirmation: string;
}
