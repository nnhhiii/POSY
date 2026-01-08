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

const { limit, ttl } = authConfig.throttle;

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
      } else {
        this.logger.error(e); // Log the error for debugging
        throw new InternalServerErrorException(
          'An error occurred while processing your request.',
        );
      }
    }
  }

  @Post('forget-password')
  @Throttle({ default: { limit, ttl } })
  async forgetPassword(@Body() dto: ForgetPasswordDto, @Req() req: Request) {
    const deviceContext: DeviceContext = {
      date: req['date'] as string,
      device: req['device'] as string,
      location: req['location'] as string,
    };

    try {
      await this.forgetPasswordService.forgetPassword(
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
