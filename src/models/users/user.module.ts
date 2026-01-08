import { Global, Module } from '@nestjs/common';
import { UserRepository, UserRepositoryImpl } from './repositories';
import { CreateUserModule } from './create-user/create-user.module';
import { UserController } from './user.controller';
import { UpdateUserModule } from './update-user/update-user.module';
import { DeleteUserModule } from './delete-user/delete-user.module';
import { GetUsersModule } from './get-users/get-users.module';
import { PreventManagerAdminAccessGuard } from '../../authorization/guards/prevent-manager-admin-access.guard';

@Global()
@Module({
  providers: [
    {
      provide: UserRepository,
      useClass: UserRepositoryImpl,
    },
    PreventManagerAdminAccessGuard,
  ],
  imports: [
    CreateUserModule,
    UpdateUserModule,
    DeleteUserModule,
    GetUsersModule,
  ],
  controllers: [UserController],
  exports: [UserRepository],
})
export class UserModule {}
