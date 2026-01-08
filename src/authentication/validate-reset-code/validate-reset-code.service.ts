import { Injectable } from '@nestjs/common';
import { UserRepository } from '../../models/users/repositories';
import { UserNotFoundException } from '../../models/users/exceptions';
import {
  InvalidResetCodeException,
  ResetCodeHasExpiredException,
} from '../exceptions';
import { JwtConfigService } from '../../config/jwt/config.service';
import { authConfig } from '../auth.config';
import { JwtService } from '@nestjs/jwt';
import { ValidateResetCodeDto } from '../dto';
import { ResetTokenSchema } from '../interfaces';

@Injectable()
export class ValidateResetCodeService {
  constructor(
    private userRepository: UserRepository,
    private jwtConfigService: JwtConfigService,
    private jwtService: JwtService,
  ) {}

  /**
   * Validates a user's password reset code and generates a temporary reset token.
   *
   * This method verifies that the provided reset code matches the one stored for the user
   * with the given email address and that the code has not expired. If the verification
   * succeeds, it generates and returns a JWT reset token for the user to proceed with
   * resetting their password, and saves the token to the database.
   *
   * @param {ValidateResetCodeDto} dto - An object containing the user's email and the reset code to validate.
   * @param {string} dto.email - The email address of the user requesting a password reset.
   * @param {string} dto.resetCode - The reset code provided by the user.
   * @returns {Promise<ResetTokenSchema>} An object containing the generated reset token.
   * @throws {UserNotFoundException} If no user is found with the given email.
   * @throws {InvalidResetCodeException} If the reset code is missing or does not match.
   * @throws {ResetCodeHasExpiredException} If the reset code has expired.
   */
  async validateResetCode({
    email,
    resetCode,
  }: ValidateResetCodeDto): Promise<ResetTokenSchema> {
    await this.verifyResetCode(email, resetCode);
    const resetTokenData = await this.generateResetToken(email);

    // Save the reset token and its expiration to the database
    const resetTokenExpDate = new Date(
      Date.now() + resetTokenData.expiresIn * 1000,
    );
    await this.userRepository.updateUserByEmail(email, {
      resetToken: resetTokenData.resetToken,
      resetTokenExp: resetTokenExpDate,
    });

    return resetTokenData;
  }

  /**
   * Generates a JWT reset token for the specified user's email address.
   *
   * This method creates a JWT token containing the user's email as payload,
   * using the configured secret and expiration time for password reset tokens.
   * The generated token and its expiration duration are returned.
   *
   * @param {string} email - The email address of the user for whom to generate the reset token.
   * @returns {Promise<ResetTokenSchema>} An object containing the generated reset token and its expiration time (e.g., '15m').
   * @throws {Error} If token generation fails due to internal errors or misconfiguration.
   */
  private async generateResetToken(email: string): Promise<ResetTokenSchema> {
    const payload = { email };
    const jwtSecret = this.jwtConfigService.secret;
    const resetTokenExpiresIn = authConfig.pwForgot.resetToken.expireIn;
    const resetTokenExpiresInSeconds = resetTokenExpiresIn * 60;
    // @ts-expect-error - JwtService.signAsync return type mismatch with Promise<string>
    const resetToken = await this.jwtService.signAsync(payload, {
      expiresIn: resetTokenExpiresIn + 'm',
      secret: jwtSecret,
    });
    return {
      resetToken,
      expiresIn: resetTokenExpiresInSeconds,
    };
  }

  /**
   * Verifies the reset code for a user based on their email address.
   *
   * @param {string} email - The email address of the user requesting password reset.
   * @param {string} code - The reset code provided by the user.
   * @throws {UserNotFoundException} If no user is found with the given email.
   * @throws {InvalidResetCodeException} If the reset code is missing or does not match.
   * @throws {ResetCodeHasExpiredException} If the reset code has expired.
   * @returns {Promise<void>} Resolves if the reset code is valid and not expired.
   */
  private async verifyResetCode(email: string, code: string): Promise<void> {
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new UserNotFoundException({ email });
    }
    // The reset code is invalid
    if (!user.resetCode || user.resetCode !== code) {
      throw new InvalidResetCodeException();
    }
    // The reset code has expired
    if (user.resetCodeExp && user.resetCodeExp < new Date()) {
      throw new ResetCodeHasExpiredException();
    }
  }
}
