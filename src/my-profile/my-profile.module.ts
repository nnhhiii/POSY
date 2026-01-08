import { Module } from '@nestjs/common';
import { MyProfileController } from './my-profile.controller';
import { UserModule } from '../models/users/user.module';
import { GetUsersModule } from '../models/users/get-users/get-users.module';
import { UpdateUserModule } from '../models/users/update-user/update-user.module';
import { LoggerModule } from '../logger/logger.module';

@Module({
  imports: [UserModule, GetUsersModule, UpdateUserModule, LoggerModule],
  controllers: [MyProfileController],
})
export class MyProfileModule {}
