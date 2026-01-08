import { Module } from '@nestjs/common';
import { SignInService } from './sign-in.service';
import { UserModule } from '../../models/users/user.module';
import { TokenGeneratorsModule } from '../common/token-generators/token-generators.module';

@Module({
  imports: [UserModule, TokenGeneratorsModule],
  providers: [SignInService],
  exports: [SignInService],
})
export class SignInModule {}
