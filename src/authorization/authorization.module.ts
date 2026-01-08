import { Module, forwardRef } from '@nestjs/common';
import { AccessControlModule } from './access-control/access-control.module';
import { UserModule } from '../models/users/user.module';

@Module({
  imports: [forwardRef(() => UserModule), AccessControlModule],
  exports: [AccessControlModule],
})
export class AuthorizationModule {}
