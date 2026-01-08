import { registerAs } from '@nestjs/config';

export default registerAs('mailersend', () => ({
  api_key: process.env.MAILERSEND_API_KEY,
  from: process.env.MAILERSEND_FROM,
}));
