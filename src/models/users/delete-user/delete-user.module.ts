import { Module } from '@nestjs/common';
import { DeleteUserService } from './delete-user.service';

@Module({
  providers: [DeleteUserService],
  exports: [DeleteUserService],
})
export class DeleteUserModule {}
