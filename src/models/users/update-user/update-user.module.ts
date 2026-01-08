import { Module } from '@nestjs/common';
import { UpdateUserService } from './update-user.service';

@Module({
  providers: [UpdateUserService],
  exports: [UpdateUserService],
})
export class UpdateUserModule {}
