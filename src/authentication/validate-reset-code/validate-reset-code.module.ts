import { Module } from '@nestjs/common';
import { ValidateResetCodeService } from './validate-reset-code.service';
import { JwtModule } from '@nestjs/jwt';
import { UserModule } from '../../models/users/user.module';
import { JwtConfigModule } from '../../config';

@Module({
  imports: [UserModule, JwtModule, JwtConfigModule],
  providers: [ValidateResetCodeService],
  exports: [ValidateResetCodeService],
})
export class ValidateResetCodeModule {}
