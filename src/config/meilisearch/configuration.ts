import { registerAs } from '@nestjs/config';

export default registerAs('meilisearch', () => ({
  host: process.env.MEILI_HOST,
  master_key: process.env.MEILI_MASTER_KEY,
}));
