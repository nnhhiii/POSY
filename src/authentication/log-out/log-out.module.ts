import { Module } from '@nestjs/common';
import { LogOutService } from './log-out.service';
import { UserModule } from '../../models/users/user.module';

@Module({
  imports: [UserModule],
  providers: [LogOutService],
  exports: [LogOutService],
})
export class LogOutModule {}
