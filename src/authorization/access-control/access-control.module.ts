import { Global, Module } from '@nestjs/common';
import { AccessControlService } from './access-control.service';
import { RoleGuard } from '../guards/role.guard';

@Global()
@Module({
  providers: [AccessControlService, RoleGuard],
  exports: [AccessControlService, RoleGuard],
})
export class AccessControlModule {}
