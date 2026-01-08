import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { UserModule } from '../models/users/user.module';
import { JwtStrategy } from './strategy';
import { AppConfigModule, JwtConfigModule } from '../config';
import { MailModule } from '../mails/mail.module';
import { ValidateResetCodeModule } from './validate-reset-code/validate-reset-code.module';
import { ResetPasswordModule } from './reset-password/reset-password.module';
import { ForgetPasswordModule } from './forget-password/forget-password.module';
import { SignInModule } from './sign-in/sign-in.module';
import { RefreshAccessTokenModule } from './refresh-access-token/refresh-access-token.module';
import { TokenGeneratorsModule } from './common/token-generators/token-generators.module';
import { LogOutModule } from './log-out/log-out.module';

@Module({
  imports: [
    JwtModule.register({}),
    TokenGeneratorsModule,
    UserModule,
    JwtConfigModule,
    MailModule,
    ValidateResetCodeModule,
    ResetPasswordModule,
    ForgetPasswordModule,
    SignInModule,
    RefreshAccessTokenModule,
    AppConfigModule,
    LogOutModule,
  ],
  controllers: [AuthController],
  providers: [JwtStrategy],
})
export class AuthModule {}
