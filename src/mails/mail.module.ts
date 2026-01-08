import { Module } from '@nestjs/common';
import { MailerSendService } from './mailersend.service';
import { AppConfigModule, MailerSendConfigModule } from '../config';
import { HandlebarsService } from './handlebars.service';

@Module({
  imports: [AppConfigModule, MailerSendConfigModule],
  providers: [MailerSendService, HandlebarsService],
  exports: [MailerSendService, HandlebarsService],
})
export class MailModule {}
