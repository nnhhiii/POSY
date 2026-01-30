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
  UserQueryParamsDto,
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
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
  ApiQuery,
} from '@nestjs/swagger';
import { createPageResponseSchema } from '../../common/dto';

@ApiTags('User')
@ApiBearerAuth()
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
  @ApiOperation({
    summary: 'Get user by ID',
    description: `Fetches detailed information for a specific user by their unique ID. Accessible by 
    ADMIN and MANAGER roles. Managers cannot access admin user details. Returns 400 if the user is not found.`,
  })
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({
    status: 200,
    description: 'User details',
    type: UserDetailedResponseDto,
  })
  @ApiResponse({ status: 400, description: 'User not found' })
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
  @ApiOperation({
    summary: 'Get all users',
    description: `Returns a paginated list of all users. Accessible by ADMIN and MANAGER roles. 
    Managers cannot see admin users. Supports filtering by query parameters such as search query 
    (by name, email, username), role, active status, etc. Used for listing and searching users.`,
  })
  @ApiQuery({ name: 'query', required: false, type: UserQueryParamsDto })
  @ApiResponse({
    status: 200,
    description: 'Paginated list of users',
    schema: createPageResponseSchema(UserPreviewResponseDto),
  })
  async getUsers(
    @Query() query: UserQueryParamsDto,
    @Req() req: Request,
  ): Promise<Page<UserPreviewResponseDto>> {
    try {
      const requesterRole = (req.user as JwtPayload).role;
      const queryParams = query.toQueryParams();

      const userPage = await this.getUsersService.getAll(
        queryParams,
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
    } catch (e) {
      this.logger.error(e);
      throw new InternalServerErrorException(
        'An error occurred while processing your request.',
      );
    }
  }

  @Post('')
  @Roles(Role.ADMIN, Role.MANAGER)
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @ApiOperation({
    summary: 'Create a new user',
    description: `Creates a new user with the provided details. Only accessible by ADMIN and MANAGER roles. 
    Managers cannot create admin users. Returns the created user preview. Throws 400 for duplicate entries.`,
  })
  @ApiBody({ type: CreateUserDto })
  @ApiResponse({
    status: 201,
    description: 'User created',
    type: UserPreviewResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Duplicate entry or unauthorized' })
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
  @ApiOperation({
    summary: 'Update a user',
    description: `Updates an existing user by their ID. Only accessible by ADMIN and MANAGER roles. 
    Managers cannot update admin users. Returns the updated user. Throws 400 for not found or duplicate entries.`,
  })
  @ApiParam({ name: 'id', type: String })
  @ApiBody({ type: UpdateUserDto })
  @ApiResponse({
    status: 200,
    description: 'User updated',
    type: UserPreviewResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'User not found or duplicate entry',
  })
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
  @ApiOperation({
    summary: 'Toggle user active status',
    description: `Toggles the active status of a user by their ID. Only accessible by ADMIN and MANAGER roles. 
    Managers cannot toggle admin user status. Returns a success message. Throws 400 if the user is not found.`,
  })
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({
    status: 200,
    description: 'User active status toggled',
  })
  @ApiResponse({ status: 400, description: 'User not found' })
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

  @Put('update-password/:id')
  @Roles(Role.ADMIN, Role.MANAGER)
  @PreventManagerAdminAccess('id')
  @UseGuards(AuthGuard('jwt'), RoleGuard, PreventManagerAdminAccessGuard)
  @ApiOperation({
    summary: 'Update user password',
    description: `Updates the password for a user. Only accessible by ADMIN and MANAGER roles. 
    Managers cannot update admin user passwords. Returns a success message. Throws 400 if the user is not found.`,
  })
  @ApiBody({ type: UpdatePasswordDto })
  @ApiResponse({
    status: 200,
    description: 'User password updated',
  })
  @ApiResponse({ status: 400, description: 'User not found' })
  async updateUserPassword(@Param('id') id: string, @Body() dto: UpdatePasswordDto) {
    try {
      await this.updateUserService.updatePassword(id, dto.newPassword);
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
  @ApiOperation({
    summary: 'Delete a user',
    description: `Soft deletes a user by their ID. Only accessible by ADMIN and MANAGER roles. 
    Managers cannot delete admin users. Returns a success message. Throws 400 if the user is not found.`,
  })
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({ status: 200, description: 'User deleted' })
  @ApiResponse({ status: 400, description: 'User not found' })
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
  @ApiOperation({
    summary: 'Unlock user account',
    description: `Unlocks a locked user account by resetting failed login attempts and lockout expiration. 
    Only accessible by ADMIN and MANAGER roles. Managers cannot unlock admin users. Returns a success message. 
    Throws 400 if the user is not found or if the account is not locked.`,
  })
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({ status: 200, description: 'User unlocked' })
  @ApiResponse({
    status: 400,
    description: 'User not found or account not locked',
  })
  async unlockUser(@Param('id') id: string) {
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
