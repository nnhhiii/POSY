import { Module } from '@nestjs/common';
import { RefreshAccessTokenService } from './refresh-access-token.service';
import { TokenGeneratorsModule } from '../common/token-generators/token-generators.module';
import { UserModule } from '../../models/users/user.module';

@Module({
  imports: [TokenGeneratorsModule, UserModule],
  providers: [RefreshAccessTokenService],
  exports: [RefreshAccessTokenService],
})
export class RefreshAccessTokenModule {}
