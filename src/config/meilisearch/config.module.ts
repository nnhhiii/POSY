import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MeiliSearchConfigService } from './config.service';
import configuration from './configuration';
import Joi from '@hapi/joi';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [configuration],
      validationSchema: Joi.object({
        MEILI_HOST: Joi.string().uri().required(),
        MEILI_MASTER_KEY: Joi.string().min(1).required(),
      }),
    }),
  ],
  providers: [MeiliSearchConfigService],
  exports: [MeiliSearchConfigService],
})
export class MeilisearchConfigModule {}
