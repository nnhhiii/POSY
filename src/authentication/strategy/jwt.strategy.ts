import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtConfigService } from '../../config/jwt/config.service';
import { UserRepository } from '../../models/users/repositories';
import { JwtPayload } from '../interfaces';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  @Inject(WINSTON_MODULE_NEST_PROVIDER)
  private readonly logger: import('winston').Logger;

  constructor(
    private userRepository: UserRepository,
    jwtConfigService: JwtConfigService,
  ) {
    const jwtSecret = jwtConfigService.secret;
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: jwtSecret,
    });
  }

  /**
   * Validates the JWT payload and ensures the user exists and is active.
   * @param payload - The decoded JWT payload.
   * @returns The validated JWT payload if the user is valid.
   * @throws UnauthorizedException if the user is not found or inactive.
   */
  async validate(payload: JwtPayload): Promise<JwtPayload> {
    this.logger.debug(
      `JWT Validation - Received payload: ${JSON.stringify(payload)}`,
    );

    if (!payload) {
      this.logger.error('JWT Validation - Payload is undefined or null');
      throw new UnauthorizedException('Invalid token payload');
    }

    if (!payload.sub) {
      this.logger.error(
        `JWT Validation - Payload missing sub (user ID): ${JSON.stringify(payload)}`,
      );
      throw new UnauthorizedException('Invalid token: missing user ID');
    }

    this.logger.debug(
      `JWT Validation - Looking up user with ID: ${payload.sub}`,
    );
    const user = await this.userRepository.findById(payload.sub);

    this.logger.debug(`JWT Validation - User found: ${JSON.stringify(user)}`);

    if (!user || !user.isActive) {
      this.logger.warn(
        `JWT Validation - User not found or inactive. User ID: ${payload.sub}`,
      );
      throw new UnauthorizedException('User not found or inactive');
    }

    this.logger.debug('JWT Validation - Success. Returning payload');
    return payload;
  }
}
