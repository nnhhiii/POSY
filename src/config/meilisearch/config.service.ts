import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MeiliSearchConfigService {
  constructor(private readonly configService: ConfigService) {}

  get host(): string {
    return this.configService.get<string>('meilisearch.host')!;
  }

  get masterKey(): string {
    return this.configService.get<string>('meilisearch.master_key')!;
  }
}
