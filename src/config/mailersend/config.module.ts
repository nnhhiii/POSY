import { Module } from '@nestjs/common';
import { MailerSendConfigService } from './config.service';
import { ConfigModule } from '@nestjs/config';
import configuration from './configuration';
import Joi from '@hapi/joi';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [configuration],
      validationSchema: Joi.object({
        MAILERSEND_API_KEY: Joi.string().min(1).required(),
        MAILERSEND_FROM: Joi.string().min(1).required(),
      }),
    }),
  ],
  providers: [MailerSendConfigService],
  exports: [MailerSendConfigService],
})
export class MailerSendConfigModule {}
