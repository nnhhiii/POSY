import { Inject, Injectable } from '@nestjs/common';
import { authConfig } from '../auth.config';
import { DeviceContext } from '../../common/interfaces';
import crypto from 'crypto';
import { UserNotFoundException } from '../../models/users/exceptions';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import winston from 'winston';
import { UserRepository } from '../../models/users/repositories';
import { HandlebarsService } from '../../mails/handlebars.service';
import { MailerSendService } from '../../mails/mailersend.service';

@Injectable()
export class ForgetPasswordService {
  @Inject(WINSTON_MODULE_NEST_PROVIDER)
  private readonly logger: winston.Logger;

  constructor(
    private userRepository: UserRepository,
    private handlebarsService: HandlebarsService,
    private mailerSendService: MailerSendService,
  ) {}

  async forgetPassword(
    email: string,
    subject: string,
    deviceContext: DeviceContext,
  ): Promise<void> {
    // Check if the account has been deleted or disabled
    const user = await this.userRepository.findByEmail(email);
    if (user?.isDeleted || !user?.isActive) {
      this.logger.debug(
        `Password reset requested for deleted or disabled account: ${email}`,
      );
      return;
    }

    const { code, expiresIn } = this.generateResetCode();

    try {
      await this.saveResetCode(email, code, expiresIn);
    } catch (e) {
      // If user not found, log and exit silently to avoid email enumeration
      if (e instanceof UserNotFoundException) {
        this.logger.debug(e.message);
        return;
      } else {
        throw e;
      }
    }

    // Send the reset email with the generated code
    await this.sendResetEmail(email, code, deviceContext, subject);
  }
  /**
   * Generates a numeric reset code and sets its expiration time.
   * The code length and expiration are configurable via `authConfig`.
   * The reset code is a random integer of the specified length.
   *
   * @returns An object containing:
   *   - `code`: The generated reset code as a string.
   *   - `expiresAt`: The expiration date/time for the reset code.
   */
  private generateResetCode(): { code: string; expiresIn: Date } {
    const codeLength = authConfig.pwForgot.resetCode.length;
    const codeExpire = authConfig.pwForgot.resetCode.expire;

    const code = crypto
      .randomInt(10 ** (codeLength - 1), 10 ** codeLength - 1)
      .toString();
    const expiresIn = new Date(Date.now() + codeExpire * 60 * 1000);

    return { code, expiresIn };
  }

  /**
   * Updates the user's record with a new password reset code and its expiration time.
   * @param email - The user's email address to identify the account.
   * @param code - The generated password reset code to store.
   * @param expiresIn - The expiration date/time for the reset code.
   * @throws UserNotFoundException - If the user is not found in the database.
   */
  private async saveResetCode(email: string, code: string, expiresIn: Date) {
    return await this.userRepository.updateUserByEmail(email, {
      resetCode: code,
      resetCodeExp: expiresIn,
    });
  }

  /**
   * Sends a password reset email containing the reset code to the user.
   *
   * This method renders the email template with contextual variables and dispatches the email.
   *
   * @param email - The recipient user's email address.
   * @param resetCode - The generated password reset code to include in the email.
   * @param deviceContext - Contextual information about the device/location/date of the request.
   * @param subject - The subject line for the password reset email.
   * @returns Promise<void> - Resolves when the email is successfully sent.
   */
  private async sendResetEmail(
    email: string,
    resetCode: string,
    deviceContext: DeviceContext,
    subject: string,
  ) {
    const codeExpiresIn = authConfig.pwForgot.resetCode.expire.toString();

    const variables: Record<string, string> = {
      code: resetCode,
      codeExpireMinutes: codeExpiresIn,
      date: deviceContext.date,
      device: deviceContext.device,
      location: deviceContext.location,
    };

    // Render the HTML email template with variables and collect inline images
    const { html, attachments } = await this.handlebarsService.render(
      'forget-password',
      variables,
    );

    // Send the forgot password email with the reset code and inline images
    await this.mailerSendService.sendEmail(email, subject, html, attachments);
  }
}
