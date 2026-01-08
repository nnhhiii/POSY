// Application configuration for NestJS. Loads environment variables for app environment, name, and port.

import { registerAs } from '@nestjs/config';

export default registerAs('app', () => ({
  env: process.env.APP_ENV,
  name: process.env.APP_NAME,
  port: process.env.APP_PORT,
}));
