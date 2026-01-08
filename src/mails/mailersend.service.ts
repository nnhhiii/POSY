import { Inject, Injectable } from '@nestjs/common';
import { EmailAttachment, EmailSender } from './interfaces';
import { MailerSendConfigService } from '../config/mailersend/config.service';
import {
  Attachment,
  EmailParams,
  MailerSend,
  Recipient,
  Sender,
} from 'mailersend';
import { AppConfigService } from '../config/app/config.service';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';

@Injectable()
export class MailerSendService implements EmailSender {
  private readonly appName: string;
  private readonly sentFrom: string;
  private readonly mailer: MailerSend;

  @Inject(WINSTON_MODULE_NEST_PROVIDER)
  private readonly logger: import('winston').Logger;

  constructor(
    appConfigService: AppConfigService,
    mailerSendConfigService: MailerSendConfigService,
  ) {
    this.appName = appConfigService.name;
    this.appName = this.sentFrom = mailerSendConfigService.from;
    this.mailer = new MailerSend({ apiKey: mailerSendConfigService.apiKey });
  }

  /**
   * Sends an email using the MailerSend API.
   * @param to - Recipient email address
   * @param subject - Email subject line
   * @param htmlContent - HTML content of the email body
   * @param attachments - Optional inline attachments (e.g., embedded images)
   * @returns Promise that resolves when the email is sent
   */
  async sendEmail(
    to: string,
    subject: string,
    htmlContent: string,
    attachments?: EmailAttachment[],
  ): Promise<void> {
    const sentFrom = new Sender(this.sentFrom, this.appName);
    const recipients = [new Recipient(to)];
    const emailParams = new EmailParams()
      .setFrom(sentFrom)
      .setTo(recipients)
      .setSubject(subject)
      .setHtml(htmlContent);

    // Add inline attachments if provided
    if (attachments && attachments.length > 0) {
      const mailerSendAttachments = attachments.map((attachment) => {
        return new Attachment(
          attachment.content.toString('base64'),
          attachment.filename,
          'inline',
          attachment.id,
        );
      });

      emailParams.setAttachments(mailerSendAttachments);
    }

    await this.mailer.email
      .send(emailParams)
      .then((response) => this.logger.debug(response))
      .catch((error: unknown) => {
        const mailerErr = this.beautifyErr(error);
        throw new Error(mailerErr);
      });
  }

  private beautifyErr(error: unknown): string {
    let formatted = '';
    if (
      error &&
      typeof error === 'object' &&
      'statusCode' in error &&
      'body' in error
    ) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-member-access
      const statusCode = (error as any).statusCode;
      formatted += `MailerSend Error with code ${statusCode}:\n`;

      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-member-access
      const body = (error as any).body;
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      if (body.message) formatted += `${body.message}\n`;
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      if (body.errors) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument,@typescript-eslint/no-unsafe-member-access
        for (const [field, messages] of Object.entries(body.errors)) {
          formatted += `${field}:\n`;
          for (const msg of messages as string[]) {
            formatted += `  - ${msg}\n`;
          }
        }
      }
    }
    return formatted;
  }
}
