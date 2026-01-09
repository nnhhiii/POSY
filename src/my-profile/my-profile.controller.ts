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

@Controller('my-profile')
@UseGuards(AuthGuard('jwt'))
export class MyProfileController {
  constructor(
    private readonly getUsersService: GetUsersService,
    private readonly updateUserService: UpdateUserService,
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private readonly logger: Logger,
  ) {}

  @Get('')
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
  async changePassword(
    @Body() dto: UpdatePasswordDto,
    @Req() req: Request,
  ): Promise<{ message: string }> {
    const userId = (req.user as JwtPayload).sub;

    try {
      // Ensure the user can only change their own password
      dto.id = userId;

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
