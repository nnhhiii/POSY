import { Injectable } from '@nestjs/common';
import { JwtConfigService } from '../../config/jwt/config.service';
import { JsonWebTokenError, JwtService, TokenExpiredError } from '@nestjs/jwt';
import {
  InvalidResetTokenException,
  ResetTokenHasExpiredException,
} from '../exceptions';
import { ResetPasswordDto } from '../dto';
import { UserRepository } from '../../models/users/repositories';
import { hash } from '../../common/utilities/hash.util';

@Injectable()
export class ResetPasswordService {
  constructor(
    private jwtConfigService: JwtConfigService,
    private jwtService: JwtService,
    private userRepository: UserRepository,
  ) {}

  /**
   * Resets a user's password using a valid reset token and a new password.
   *
   * This method verifies the provided JWT reset token to extract the user's email address,
   * then validates the token against the one stored in the database.
   * It then securely hashes the new password and updates the user's password hash in the database.
   * If the token is invalid, expired, or the user does not exist, appropriate exceptions are thrown.
   *
   * @param {ResetPasswordDto} param0 - An object containing the reset token and the new password.
   * @param {string} param0.token - The JWT reset token provided to the user for password reset.
   * @param {string} param0.newPassword - The new password to set for the user.
   * @returns {Promise<void>} Resolves when the password has been successfully updated.
   * @throws {UserNotFoundException} If no user is found with the extracted email.
   * @throws {ResetTokenHasExpiredException} If the reset token has expired.
   * @throws {InvalidResetTokenException} If the reset token is invalid or malformed.
   * @throws {Error} For any other internal errors during the process.
   */
  async resetPassword({ token, newPassword }: ResetPasswordDto): Promise<void> {
    const email = this.verifyResetToken(token);

    // Verify the token against the database
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new InvalidResetTokenException();
    }

    // Check if the token matches the one in the database
    if (!user.resetToken || user.resetToken !== token) {
      throw new InvalidResetTokenException();
    }

    // Check if the token has expired
    if (user.resetTokenExp && user.resetTokenExp < new Date()) {
      throw new ResetTokenHasExpiredException();
    }

    const hashed = await hash(newPassword);
    await this.userRepository.updateUserByEmail(email, {
      passwordHash: hashed,
      resetToken: null,
      resetTokenExp: null,
      resetCode: null,
      resetCodeExp: null,
    });
  }

  /**
   * Verifies the validity of a password reset JWT token and extracts the user's email.
   *
   * This method checks the provided JWT reset token using the configured secret.
   * If the token is valid and not expired, it returns the email address encoded in the token.
   * If the token is expired, it throws a `ResetTokenHasExpiredException`.
   * If the token is invalid or malformed, it throws an `InvalidResetTokenException`.
   *
   * @param {string} token - The JWT reset token to verify.
   * @returns {string} The email address extracted from the valid reset token.
   * @throws {ResetTokenHasExpiredException} If the token has expired.
   * @throws {InvalidResetTokenException} If the token is invalid or malformed.
   */
  private verifyResetToken(token: string): string {
    const jwtSecret = this.jwtConfigService.secret;
    try {
      const decoded: { email: string } = this.jwtService.verify(token, {
        secret: jwtSecret,
      });
      return decoded.email;
    } catch (e) {
      if (e instanceof TokenExpiredError) {
        throw new ResetTokenHasExpiredException();
      }
      if (e instanceof JsonWebTokenError) {
        throw new InvalidResetTokenException();
      }
      throw e;
    }
  }
}
