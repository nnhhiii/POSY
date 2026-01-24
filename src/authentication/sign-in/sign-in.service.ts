import { Injectable } from '@nestjs/common';
import { UserRepository } from '../../models/users/repositories';
import { SignInDto } from '../dto';
import {
  AccountLockedException,
  InvalidCredentialsException,
} from '../exceptions';
import { hash, verifyHash } from '../../common/utilities/hash.util';
import { JwtPayload, AuthTokensSchema } from '../interfaces';
import { User } from '../../models/users/types/user.class';
import { TokenGeneratorsService } from '../common/token-generators/token-generators.service';
import { authConfig } from '../auth.config';

@Injectable()
export class SignInService {
  constructor(
    private userRepository: UserRepository,
    private tokenGeneratorsService: TokenGeneratorsService,
  ) {}

  /**
   * Handles user sign-in requests.
   * - Receives user credentials (email and password) in the request body.
   * - Looks up the user by email in the database.
   * - Verifies the provided password against the stored password hash.
   * - Returns a signed JWT access token if authentication is successful.
   * @param dto SignInDto containing email and password
   * @throws ForbiddenException if user is not found or password does not match
   * @returns An object containing the access token
   */
  async signin({ username, password }: SignInDto) {
    // Find the user by username
    const user = await this.userRepository.findByUsername(username);

    // If user not found or has been deleted/disabled, throw invalid credentials exception
    if (!user || user.isDeleted || !user.isActive) {
      throw new InvalidCredentialsException();
    }

    // Check if the account is locked due to too many failed login attempts
    if (user.lockoutExpiresAt && user.lockoutExpiresAt > new Date()) {
      throw new AccountLockedException(
        'Account is temporarily locked due to multiple failed sign-in attempts. Please try again later.',
      );
    }

    // Verify the provided password with the stored password hash
    const pwMatches = await verifyHash(user.passwordHash!, password);
    if (!pwMatches) {
      user.failedLoginAttempts++;
      const { max, lockTime } = authConfig.signIn.attempt;
      // If maximum failed attempts reached, lock the account
      if (user.failedLoginAttempts >= max) {
        user.failedLoginAttempts = 0;
        user.lockoutExpiresAt = new Date(Date.now() + lockTime * 60 * 1000);
      }
      await this.userRepository.update(user.id!, {
        failedLoginAttempts: user.failedLoginAttempts,
        lockoutExpiresAt: user.lockoutExpiresAt,
      });
      throw new InvalidCredentialsException();
    }

    // Generate signed JWT access and refresh tokens
    const { access_token, refresh_token } = await this.signToken(user);

    // Store the hashed refresh token in the database
    const refresh_token_hash = await hash(refresh_token);

    // Update the user's failed login attempts and refresh token hash
    await this.userRepository.updateUserByEmail(user.email, {
      refreshTokenHash: refresh_token_hash,
      failedLoginAttempts: 0,
      lockoutExpiresAt: null,
    });

    // Calculate expires_in (in seconds)
    const accessTokenExpireHours = authConfig.signIn.accessToken.expire;
    const expires_in = accessTokenExpireHours * 3600;

    // Return the access and refresh tokens and expires_in
    return { access_token, refresh_token, expires_in };
  }

  /**
   * Generates signed JWT access and refresh tokens for the authenticated user.
   *
   * This method creates a JWT access token and a refresh token using the user's ID and email as payload.
   * The access token is signed with the primary JWT secret and expires according to the configured duration.
   * The refresh token is signed with a separate refresh secret and has its own expiration period.
   *
   * @param {User} user - The authenticated user for whom to generate tokens.
   * @returns {Promise<AuthTokensSchema>} An object containing the signed access and refresh tokens.
   * @throws {Error} If token signing fails due to misconfiguration or internal errors.
   */
  private async signToken(user: User): Promise<AuthTokensSchema> {
    // Prepare the payload for the JWT token
    const payload: JwtPayload = {
      sub: user.id!,
      email: user.email,
      role: user.role,
      username: user.username,
    };

    const access_token =
      await this.tokenGeneratorsService.generateAccessToken(payload);
    const refresh_token =
      await this.tokenGeneratorsService.generateRefreshToken(payload);

    return { access_token, refresh_token };
  }
}
