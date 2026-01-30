import {
  Body,
  Controller,
  Get,
  Inject,
  InternalServerErrorException,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { GetUsersService } from '../models/users/get-users/get-users.service';
import { UpdateUserService } from '../models/users/update-user/update-user.service';
import {
  UpdatePasswordDto,
  UpdateUserDto,
  UserDetailedResponseDto,
} from '../models/users/dto';
import { JwtPayload } from '../authentication/interfaces';
import { Request } from 'express';
import { plainToInstance } from 'class-transformer';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiBody,
} from '@nestjs/swagger';

@ApiTags('My Profile')
@ApiBearerAuth()
@Controller('my-profile')
@UseGuards(AuthGuard('jwt'))
export class MyProfileController {
  constructor(
    private readonly getUsersService: GetUsersService,
    private readonly updateUserService: UpdateUserService,
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private readonly logger: Logger,
  ) { }


  @Get()
  @ApiOperation({
    summary: 'Get my profile',
    description:
      'Returns detailed information about the authenticated user profile.',
  })
  @ApiResponse({
    status: 200,
    description: 'User profile details',
    type: UserDetailedResponseDto,
  })
  @ApiResponse({ status: 500, description: 'Internal server error' })

  async getProfile(@Req() req: Request): Promise<UserDetailedResponseDto> {
    const userId = (req.user as JwtPayload).sub;

    try {
      const user = await this.getUsersService.getUserById(userId);
      return plainToInstance(UserDetailedResponseDto, user, {
        excludeExtraneousValues: true,
      });
    } catch (e) {
      this.logger.error(e);
      throw new InternalServerErrorException(
        'An error occurred while retrieving your profile.',
      );
    }
  }

  @Put()
  @ApiOperation({
    summary: 'Update my profile',
    description:
      'Updates the authenticated user profile with the provided details.',
  })
  @ApiBody({ type: UpdateUserDto })
  @ApiResponse({
    status: 200,
    description: 'Updated user profile',
    type: UserDetailedResponseDto,
  })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async updateProfile(
    @Body() dto: UpdateUserDto,
    @Req() req: Request,
  ): Promise<UserDetailedResponseDto> {
    const userId = (req.user as JwtPayload).sub;

    try {
      const updatedUser = await this.updateUserService.updateUser(userId, dto);
      return plainToInstance(UserDetailedResponseDto, updatedUser, {
        excludeExtraneousValues: true,
      });
    } catch (e) {
      this.logger.error(e);
      throw new InternalServerErrorException(
        'An error occurred while updating your profile.',
      );
    }
  }

  @Put('change-password')
  @ApiOperation({
    summary: 'Change my password',
    description:
      'Changes the password for the authenticated user. Requires current authentication.',
  })
  @ApiBody({ type: UpdatePasswordDto })
  @ApiResponse({
    status: 200,
    description: 'Password changed successfully',
    schema: { example: { message: 'Password changed successfully' } },
  })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async changePassword(
    @Body() dto: UpdatePasswordDto,
    @Req() req: Request,
  ): Promise<{ message: string }> {
    const userId = (req.user as JwtPayload).sub;

    try {
      await this.updateUserService.updatePassword(userId, dto.newPassword);
      return { message: 'Password changed successfully' };
    } catch (e) {
      this.logger.error(e);
      throw new InternalServerErrorException(
        'An error occurred while changing your password.',
      );
    }
  }
}
