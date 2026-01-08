import { Module } from '@nestjs/common';
import { GetUsersService } from './get-users.service';

@Module({
  providers: [GetUsersService],
  exports: [GetUsersService],
})
export class GetUsersModule {}
