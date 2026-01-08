import { Global, Module } from '@nestjs/common';
import { logger } from './logger.config';
import { WinstonModule } from 'nest-winston';

@Global()
@Module({
  imports: [WinstonModule.forRoot(logger)],
  exports: [WinstonModule],
})
export class LoggerModule {}
