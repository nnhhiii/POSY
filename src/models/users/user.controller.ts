import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  InternalServerErrorException,
  Param,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { CreateUserService } from './create-user/create-user.service';
import { UpdateUserService } from './update-user/update-user.service';
import { User } from './types/user.class';
import {
  DuplicateEntryException,
  UnnecessaryOperationException,
} from '../../common/exceptions';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import {
  CreateUserDto,
  UpdatePasswordDto,
  UpdateUserDto,
  UserDetailedResponseDto,
  UserPreviewResponseDto,
} from './dto';
import { hash } from '../../common/utilities/hash.util';
import { AuthGuard } from '@nestjs/passport';
import { UserNotFoundException } from './exceptions';
import { RoleGuard } from '../../authorization/guards/role.guard';
import { PreventManagerAdminAccessGuard } from '../../authorization/guards/prevent-manager-admin-access.guard';
import { Roles, PreventManagerAdminAccess } from '../../common/decorators';
import { Role } from '../../common/enums';
import { GetUsersService } from './get-users/get-users.service';
import { plainToInstance } from 'class-transformer';
import { Page } from '../../common/interfaces';
import { JwtPayload } from '../../authentication/interfaces';
import { Request } from 'express';
import { DeleteUserService } from './delete-user/delete-user.service';
import { PaginationQueryDto } from 'src/common/config/pagination.query.dto';

@Controller('user')
export class UserController {
  @Inject(WINSTON_MODULE_NEST_PROVIDER)
  private readonly logger: import('winston').Logger;

  constructor(
    private readonly createUserService: CreateUserService,
    private readonly updateUserService: UpdateUserService,
    private readonly getUsersService: GetUsersService,
    private readonly deleteUserService: DeleteUserService,
  ) {}

  @Get(':id')
  @Roles(Role.ADMIN, Role.MANAGER)
  @PreventManagerAdminAccess('id')
  @UseGuards(AuthGuard('jwt'), RoleGuard, PreventManagerAdminAccessGuard)
  async getUserById(
    @Param('id') userId: string,
  ): Promise<UserDetailedResponseDto> {
    const user = await this.getUsersService.getUserById(userId);
    return plainToInstance(UserDetailedResponseDto, user, {
      excludeExtraneousValues: true,
    });
  }

  @Get()
  @Roles(Role.ADMIN, Role.MANAGER)
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  async getUsers(
    @Query() pagination: PaginationQueryDto,
    @Req() req: Request,
  ): Promise<Page<UserPreviewResponseDto>> {
    const requesterRole = (req.user as JwtPayload).role;

    const userPage = await this.getUsersService.getAllUsers(
      pagination.page,
      pagination.pageSize,
      requesterRole,
    );

    const userPreviewItems = plainToInstance(
      UserPreviewResponseDto,
      userPage.items,
      { excludeExtraneousValues: true },
    );

    return {
      ...userPage,
      items: userPreviewItems,
    };
  }

  @Post('')
  @Roles(Role.ADMIN, Role.MANAGER)
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  async createUser(@Body() dto: CreateUserDto, @Req() req: Request) {
    const requesterRole = (req.user as JwtPayload).role;

    // Prevent managers from creating admin users
    if (requesterRole === Role.MANAGER.toString() && dto.role === 'ADMIN') {
      throw new BadRequestException(
        'Managers are not authorized to create admin users.',
      );
    }

    try {
      const user = {
        email: dto.email,
        username: dto.username,
        fullName: dto.fullName,
        passwordHash: await hash(dto.password),
        phone: dto.phone,
        role: dto.role,
        isActive: dto.isActive,
      } as User;

      return plainToInstance(
        UserPreviewResponseDto,
        await this.createUserService.createUser(user),
        {
          excludeExtraneousValues: true,
        },
      );
    } catch (e) {
      if (e instanceof DuplicateEntryException) {
        throw new BadRequestException({
          message: e.message,
          details: e.details,
        });
      }
      this.logger.error(e);
      throw new InternalServerErrorException(
        'An error occurred while processing your request.',
      );
    }
  }

  @Put(':id')
  @Roles(Role.ADMIN, Role.MANAGER)
  @PreventManagerAdminAccess('id')
  @UseGuards(AuthGuard('jwt'), RoleGuard, PreventManagerAdminAccessGuard)
  async updateUser(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    try {
      return this.updateUserService.updateUser(id, dto);
    } catch (e) {
      if (e instanceof UserNotFoundException) {
        throw new BadRequestException(e.message);
      } else if (e instanceof DuplicateEntryException) {
        throw new BadRequestException({
          message: e.message,
          details: e.details,
        });
      } else if (e instanceof BadRequestException) {
        throw e;
      }
      this.logger.error(e);
      throw new InternalServerErrorException(
        'An error occurred while processing your request.',
      );
    }
  }

  @Post(':id/toggle-active')
  @Roles(Role.ADMIN, Role.MANAGER)
  @PreventManagerAdminAccess('id')
  @UseGuards(AuthGuard('jwt'), RoleGuard, PreventManagerAdminAccessGuard)
  async toggleUserActive(@Param('id') id: string) {
    try {
      await this.updateUserService.toggleUserActive(id);
      return { message: 'User active status has been successfully toggled.' };
    } catch (e) {
      if (e instanceof UserNotFoundException) {
        throw new BadRequestException(e.message);
      } else if (e instanceof BadRequestException) {
        throw e;
      }
      this.logger.error(e);
      throw new InternalServerErrorException(
        'An error occurred while processing your request.',
      );
    }
  }

  @Post('/update-password')
  @Roles(Role.ADMIN, Role.MANAGER)
  @PreventManagerAdminAccess('id')
  @UseGuards(AuthGuard('jwt'), RoleGuard, PreventManagerAdminAccessGuard)
  async updateUserPassword(@Body() dto: UpdatePasswordDto) {
    // if (dto.newPassword !== dto.newPasswordConfirmation) {
    //   throw new BadRequestException(
    //     'New password and confirmation do not match.',
    //   );
    // }

    try {
      await this.updateUserService.updatePassword(dto.id, dto.newPassword);
      return { message: 'User password has been successfully updated.' };
    } catch (e) {
      if (e instanceof UserNotFoundException) {
        throw new BadRequestException(e.message);
      } else if (e instanceof BadRequestException) {
        throw e;
      }
      this.logger.error(e);
      throw new InternalServerErrorException(
        'An error occurred while processing your request.',
      );
    }
  }

  @Delete(':id')
  @Roles(Role.ADMIN, Role.MANAGER)
  @PreventManagerAdminAccess('id')
  @UseGuards(AuthGuard('jwt'), RoleGuard, PreventManagerAdminAccessGuard)
  async deleteUser(@Param('id') id: string) {
    try {
      await this.deleteUserService.deleteUserById(id);
      return { message: 'User has been successfully deleted.' };
    } catch (e) {
      if (e instanceof UserNotFoundException) {
        throw new BadRequestException(e.message);
      } else if (e instanceof BadRequestException) {
        throw e;
      }
      this.logger.error(e);
      throw new InternalServerErrorException(
        'An error occurred while processing your request.',
      );
    }
  }

  @Post(':id/unlock')
  @Roles(Role.ADMIN, Role.MANAGER)
  @PreventManagerAdminAccess('id')
  @UseGuards(AuthGuard('jwt'), RoleGuard, PreventManagerAdminAccessGuard)
  async unlockUser(@Query('id') id: string) {
    try {
      await this.updateUserService.unlockUser(id);
      return { message: 'User account has been successfully unlocked.' };
    } catch (e) {
      if (
        e instanceof UserNotFoundException ||
        e instanceof UnnecessaryOperationException
      ) {
        throw new BadRequestException(e.message);
      } else if (e instanceof BadRequestException) {
        throw e;
      }
      this.logger.error(e);
      throw new InternalServerErrorException(
        'An error occurred while processing your request.',
      );
    }
  }
}
