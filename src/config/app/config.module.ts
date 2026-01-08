import { Module } from '@nestjs/common';
import { AppConfigService } from './config.service';
import { ConfigModule } from '@nestjs/config';
import configuration from './configuration';
import Joi from '@hapi/joi';

// AppConfigModule manages application configuration using NestJS ConfigModule and Joi validation.
// Loads config from configuration.ts, validates environment variables (APP_NAME, APP_ENV, APP_PORT),
// applies defaults, and provides AppConfigService for app-wide access.
@Module({
  imports: [
    ConfigModule.forRoot({
      load: [configuration],
      validationSchema: Joi.object({
        APP_NAME: Joi.string().default('MyApp'),
        APP_ENV: Joi.string()
          .valid('development', 'production', 'test')
          .default('development'),
        APP_PORT: Joi.number().default(3001),
      }),
    }),
  ],
  providers: [AppConfigService],
  exports: [AppConfigService],
})
export class AppConfigModule {}
