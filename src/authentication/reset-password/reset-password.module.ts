import { Module } from '@nestjs/common';
import { ResetPasswordService } from './reset-password.service';
import { UserModule } from '../../models/users/user.module';
import { JwtModule } from '@nestjs/jwt';
import { JwtConfigModule } from '../../config';
import { ResetPasswordCleanupService } from './reset-password-cleanup.service';

@Module({
  imports: [UserModule, JwtModule, JwtConfigModule],
  providers: [ResetPasswordService, ResetPasswordCleanupService],
  exports: [ResetPasswordService],
})
export class ResetPasswordModule {}
