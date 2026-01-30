import {
  BadRequestException,
  Body,
  Controller,
  Inject,
  InternalServerErrorException,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import {
  ForgetPasswordDto,
  ResetPasswordDto,
  SignInDto,
  ValidateResetCodeDto,
} from './dto';
import { Request, Response } from 'express';
import { DeviceContext } from '../common/interfaces';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import {
  AccountLockedException,
  InvalidCredentialsException,
  InvalidRefreshTokenException,
  InvalidResetCodeException,
  InvalidResetTokenException,
  ResetCodeHasExpiredException,
  ResetTokenHasExpiredException,
} from './exceptions';
import { SignInService } from './sign-in/sign-in.service';
import { ForgetPasswordService } from './forget-password/forget-password.service';
import { ValidateResetCodeService } from './validate-reset-code/validate-reset-code.service';
import { JwtPayload, ResetTokenSchema } from './interfaces';
import { UserNotFoundException } from '../models/users/exceptions';
import { ResetPasswordService } from './reset-password/reset-password.service';
import { RefreshAccessTokenService } from './refresh-access-token/refresh-access-token.service';
import { AppConfigService } from '../config/app/config.service';
import { LogOutService } from './log-out/log-out.service';
import { AuthGuard } from '@nestjs/passport';
import { Throttle } from '@nestjs/throttler';
import { authConfig } from './auth.config';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

const { limit, ttl } = authConfig.throttle;

@ApiTags('Authentication')
@ApiBearerAuth()
@Controller('auth')
export class AuthController {
  @Inject(WINSTON_MODULE_NEST_PROVIDER)
  private readonly logger: import('winston').Logger;

  constructor(
    private appConfigService: AppConfigService,
    private signInService: SignInService,
    private forgetPasswordService: ForgetPasswordService,
    private validateResetCodeService: ValidateResetCodeService,
    private resetPasswordService: ResetPasswordService,
    private refreshAccessTokenService: RefreshAccessTokenService,
    private logoutService: LogOutService,
  ) {}

  @Post('signin')
  @Throttle({ default: { limit, ttl } })
  @ApiOperation({
    summary: 'Sign in',
    description:
      'Authenticate user and return access token. Sets refresh token as HttpOnly cookie.',
  })
  @ApiBody({ type: SignInDto })
  @ApiResponse({
    status: 200,
    description: 'Access token and expiration',
    schema: {
      example: { access_token: 'jwt', expires_in: 3600 },
    },
  })
  @ApiResponse({ status: 400, description: 'Invalid credentials' })
  @ApiResponse({ status: 401, description: 'Account locked' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async signin(
    @Body() dto: SignInDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    try {
      const { access_token, refresh_token, expires_in } =
        await this.signInService.signin(dto);

      const env = this.appConfigService.env;
      // Set the refresh token as an HttpOnly cookie
      res.cookie('refresh_token', refresh_token, {
        httpOnly: true,
        secure: env === 'production',
        sameSite: 'lax',
        path: '/auth/refresh',
      });

      return { access_token, expires_in };
    } catch (e) {
      if (e instanceof InvalidCredentialsException) {
        throw new BadRequestException(e.message);
      } else if (e instanceof AccountLockedException) {
        throw new UnauthorizedException(e.message);
      } else {
        this.logger.error(e); // Log the error for debugging
        throw new InternalServerErrorException(
          'An error occurred while processing your request.',
        );
      }
    }
  }

  @Post('forgot-password')
  @Throttle({ default: { limit, ttl } })
  @ApiOperation({
    summary: 'Request password reset',
    description: 'Send password reset link to user email if it exists.',
  })
  @ApiBody({ type: ForgetPasswordDto })
  @ApiResponse({
    status: 200,
    description: 'Password reset link sent',
    schema: {
      example: {
        message: 'If the email exists, a password reset link has been sent.',
      },
    },
  })
  @ApiResponse({ status: 500, description: 'Internal server error' })
    async forgotPassword(@Body() dto: ForgetPasswordDto, @Req() req: Request) {
    const deviceContext: DeviceContext = {
      date: req['date'] as string,
      device: req['device'] as string,
      location: req['location'] as string,
    };

    try {
      await this.forgetPasswordService.forgotPassword(
        dto.email,
        'Password Reset Request',
        deviceContext,
      );
      return {
        message: 'If the email exists, a password reset link has been sent.',
      };
    } catch (e) {
      this.logger.error(e); // Log the error for debugging
      throw new InternalServerErrorException(
        'An error occurred while processing your request.',
      );
    }
  }

  @Post('validate-reset-code')
  @Throttle({ default: { limit, ttl } })
  @ApiOperation({
    summary: 'Validate reset code',
    description: 'Validate the password reset code and return a reset token.',
  })
  @ApiBody({ type: ValidateResetCodeDto })
  @ApiResponse({
    status: 200,
    description: 'Reset token',
    schema: {
      example: { reset_token: 'token' },
    },
  })
  @ApiResponse({ status: 400, description: 'Invalid or expired reset code' })
  @ApiResponse({ status: 401, description: 'User not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async validateResetCode(
    @Body() dto: ValidateResetCodeDto,
  ): Promise<ResetTokenSchema> {
    try {
      // Return the reset token if the reset code is valid
      return await this.validateResetCodeService.validateResetCode(dto);
    } catch (e) {
      if (e instanceof UserNotFoundException) {
        throw new UnauthorizedException(e.message);
      } else if (
        e instanceof InvalidResetCodeException ||
        e instanceof ResetCodeHasExpiredException
      ) {
        throw new BadRequestException(e.message);
      }
      this.logger.error(e); // Log the error for debugging
      throw new InternalServerErrorException(
        'An error occurred while processing your request.',
      );
    }
  }

  @Post('reset-password')
  @Throttle({ default: { limit, ttl } })
  @ApiOperation({
    summary: 'Reset password',
    description: 'Reset user password using a valid reset token.',
  })
  @ApiBody({ type: ResetPasswordDto })
  @ApiResponse({
    status: 200,
    description: 'Password reset successful',
    schema: {
      example: { message: 'The password has been successfully reset.' },
    },
  })
  @ApiResponse({ status: 400, description: 'Invalid or expired reset token' })
  @ApiResponse({ status: 401, description: 'User not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async resetPassword(@Body() dto: ResetPasswordDto) {
    try {
      await this.resetPasswordService.resetPassword(dto);
      return { message: 'The password has been successfully reset.' };
    } catch (e) {
      if (e instanceof UserNotFoundException) {
        throw new UnauthorizedException(e.message);
      } else if (
        e instanceof InvalidResetTokenException ||
        e instanceof ResetTokenHasExpiredException
      ) {
        throw new BadRequestException(e.message);
      }
      this.logger.error(e); // Log the error for debugging
      throw new InternalServerErrorException(
        'An error occurred while processing your request.',
      );
    }
  }

  @Post('refresh')
  @ApiOperation({
    summary: 'Refresh access token',
    description: 'Refresh JWT access token using HttpOnly cookie.',
  })
  @ApiResponse({
    status: 200,
    description: 'New access token and expiration',
    schema: {
      example: { access_token: 'jwt', expires_in: 3600 },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Refresh token not found or invalid',
  })
  @ApiResponse({ status: 401, description: 'User not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async refreshAccessToken(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    // Read refresh token from HttpOnly cookie
    const refresh_token = req.cookies?.refresh_token as string;
    if (!refresh_token) {
      throw new BadRequestException('Refresh token not found in cookies.');
    }

    try {
      const {
        access_token,
        refresh_token: new_refresh_token,
        expires_in,
      } = await this.refreshAccessTokenService.refreshAccessToken(
        refresh_token,
      );

      const env = this.appConfigService.env;
      // Set the new refresh token as an HttpOnly cookie
      res.cookie('refresh_token', new_refresh_token, {
        httpOnly: true,
        secure: env === 'production',
        sameSite: 'lax',
        path: '/auth/refresh',
      });

      return { access_token, expires_in };
    } catch (e) {
      if (e instanceof UserNotFoundException) {
        throw new UnauthorizedException(e.message);
      } else if (e instanceof InvalidRefreshTokenException) {
        throw new BadRequestException(e.message);
      }
      this.logger.error(e); // Log the error for debugging
      throw new InternalServerErrorException(
        'An error occurred while processing your request.',
      );
    }
  }

  @Post('logout')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({
    summary: 'Logout',
    description: 'Logout user and clear refresh token cookie.',
  })
  @ApiResponse({
    status: 200,
    description: 'Logout successful',
    schema: {
      example: { success: true },
    },
  })
  @ApiResponse({ status: 400, description: 'User not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const userId = (req.user as JwtPayload).sub;
    try {
      // Remove the refresh token in database
      await this.logoutService.logout(userId);

      // Clear the refresh token cookie
      const env = this.appConfigService.env;
      res.clearCookie('refresh_token', {
        httpOnly: true,
        secure: env === 'production',
        sameSite: 'lax',
        path: '/auth/refresh',
      });

      return { success: true };
    } catch (e) {
      if (e instanceof UserNotFoundException) {
        throw new BadRequestException(e.message);
      }
      this.logger.error(e); // Log the error for debugging
      throw new InternalServerErrorException(
        'An error occurred while processing your request.',
      );
    }
  }
}
