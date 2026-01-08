import { Module } from '@nestjs/common';
import { JwtConfigService } from './config.service';
import { ConfigModule } from '@nestjs/config';
import configuration from './configuration';
import Joi from '@hapi/joi';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [configuration],
      validationSchema: Joi.object({
        JWT_SECRET: Joi.string().min(1).required(),
        JWT_REFRESH_SECRET: Joi.string().min(1).required(),
      }),
    }),
  ],
  providers: [JwtConfigService],
  exports: [JwtConfigService],
})
export class JwtConfigModule {}
