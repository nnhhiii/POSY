import { Injectable } from '@nestjs/common';
import { AuthTokensSchema, JwtPayload } from '../interfaces';
import { UserRepository } from '../../models/users/repositories';
import { UserNotFoundException } from '../../models/users/exceptions';
import { hash, verifyHash } from '../../common/utilities/hash.util';
import { InvalidRefreshTokenException } from '../exceptions';
import { TokenGeneratorsService } from '../common/token-generators/token-generators.service';
import { authConfig } from '../auth.config';

@Injectable()
export class RefreshAccessTokenService {
  constructor(
    private tokenGeneratorsService: TokenGeneratorsService,
    private userRepository: UserRepository,
  ) {}

  /**
   * Validates and refreshes authentication tokens for a user session.
   *
   * This method verifies the provided refresh token, ensuring it is valid and matches the stored hash for the user.
   * It decodes the token, removes standard JWT claims, and checks if the user exists. If the user is found and the token is valid,
   * new access and refresh tokens are generated and the refresh token hash is updated in the database. Returns the new tokens.
   *
   * @param refresh_token - The JWT refresh token to be validated and used for issuing new tokens.
   * @returns A promise that resolves to an object containing the newly generated access token, refresh token, and the access token's expiration time in seconds.
   * @throws {UserNotFoundException} If the user associated with the refresh token does not exist in the database.
   * @throws {InvalidRefreshTokenException} If the refresh token is invalid, expired, or does not match the stored hash.
   * @throws {Error} For unexpected internal errors during token verification or user update.
   */
  async refreshAccessToken(refresh_token: string): Promise<AuthTokensSchema> {
    // Verify and decode the refresh token
    const jwtPayload: JwtPayload =
      await this.tokenGeneratorsService.verifyRefreshToken<JwtPayload>(
        refresh_token,
      );
    // Delete standard JWT claims that are not needed for the new token
    delete jwtPayload.exp;
    delete jwtPayload.iat;

    const user = await this.userRepository.findById(jwtPayload.sub);
    if (!user) throw new UserNotFoundException();

    if (
      !user.refreshTokenHash ||
      !(await verifyHash(user.refreshTokenHash, refresh_token))
    ) {
      throw new InvalidRefreshTokenException();
    }

    const newAccessToken =
      await this.tokenGeneratorsService.generateAccessToken(jwtPayload);
    const newRefreshToken =
      await this.tokenGeneratorsService.generateRefreshToken(jwtPayload);

    // Save the new refresh token hash in the database
    await this.userRepository.updateUserByEmail(user.email, {
      refreshTokenHash: await hash(newRefreshToken),
    });

    // Calculate expires_in (in seconds)
    const accessTokenExpireHours = authConfig.signIn.accessToken.expire;
    const expires_in = accessTokenExpireHours * 3600;

    return {
      access_token: newAccessToken,
      refresh_token: newRefreshToken,
      expires_in,
    };
  }
}
