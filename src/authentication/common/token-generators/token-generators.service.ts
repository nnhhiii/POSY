import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { JwtConfigService } from '../../../config/jwt/config.service';
import { authConfig } from '../../auth.config';
import { JsonWebTokenError, TokenExpiredError } from 'jsonwebtoken';
import {
  InvalidRefreshTokenException,
  RefreshTokenHasExpiredException,
} from '../../exceptions';

@Injectable()
export class TokenGeneratorsService {
  private readonly accessTokenSecure: string;
  private readonly accessTokenExpiresIn: string;
  private readonly refreshTokenSecure: string;
  private readonly refreshTokenExpiresIn: string;

  constructor(
    private jwtService: JwtService,
    private jwtConfigService: JwtConfigService,
  ) {
    this.accessTokenSecure = this.jwtConfigService.secret;
    this.accessTokenExpiresIn = `${authConfig.signIn.accessToken.expire}h`;
    this.refreshTokenSecure = this.jwtConfigService.refreshSecret;
    this.refreshTokenExpiresIn = `${authConfig.signIn.refreshToken.expire}d`;
  }

  /**
   * Generates a signed JWT access token for the provided payload.
   *
   * Uses the configured access token secret and expiration time to sign the payload.
   * The payload typically contains user identification and claims required for authentication.
   *
   * @param {object} payload - The payload to encode in the JWT access token. Should include user-specific claims.
   * @returns {Promise<string>} A promise that resolves to the signed JWT access token as a string.
   * @throws {Error} If signing the token fails due to misconfiguration or internal errors.
   */
  async generateAccessToken(payload: object): Promise<string> {
    // @ts-expect-error: jwtService.signAsync may have type mismatch due to custom payload typing
    return await this.jwtService.signAsync(payload, {
      secret: this.accessTokenSecure,
      expiresIn: this.accessTokenExpiresIn,
    });
  }

  /**
   * Generates a signed JWT refresh token for the provided payload.
   *
   * Uses the configured refresh token secret and expiration time to sign the payload.
   * The payload should contain enough information to identify the user and validate the refresh process.
   *
   * @param {object} payload - The payload to encode in the JWT refresh token. Should include user-specific claims.
   * @returns {Promise<string>} A promise that resolves to the signed JWT refresh token as a string.
   * @throws {Error} If signing the token fails due to misconfiguration or internal errors.
   */
  async generateRefreshToken(payload: object): Promise<string> {
    // @ts-expect-error: jwtService.signAsync may have type mismatch due to custom payload typing
    return await this.jwtService.signAsync(payload, {
      secret: this.refreshTokenSecure,
      expiresIn: this.refreshTokenExpiresIn,
    });
  }

  /**
   * Verifies and decodes a JWT refresh token, handling all error scenarios and mapping them to custom exceptions.
   *
   * This method checks the validity and integrity of the provided JWT refresh token using the configured refresh token secret.
   * If the token is valid and not expired, it returns the decoded payload (claims). If the token is invalid, expired, or has been tampered with,
   * it throws a custom exception: InvalidRefreshTokenException for invalid tokens, and RefreshTokenHasExpiredException for expired tokens.
   * This is typically used to issue new access tokens during the refresh flow.
   *
   * @template T - The expected shape of the decoded payload (defaults to any object).
   * @param {string} token - The JWT refresh token to verify and decode.
   * @returns {Promise<T>} The decoded payload of the refresh token if verification is successful.
   * @throws {InvalidRefreshTokenException} If the token is invalid, malformed, or has been tampered with.
   * @throws {RefreshTokenHasExpiredException} If the token is expired.
   * @throws {Error} For unexpected internal errors during token verification.
   */
  async verifyRefreshToken<T extends object = any>(token: string): Promise<T> {
    try {
      return await this.jwtService.verifyAsync(token, {
        secret: this.refreshTokenSecure,
      });
    } catch (e) {
      if (e instanceof JsonWebTokenError) {
        throw new InvalidRefreshTokenException();
      } else if (e instanceof TokenExpiredError) {
        throw new RefreshTokenHasExpiredException();
      }
      throw e;
    }
  }
}
