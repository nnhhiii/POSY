import { Injectable } from '@nestjs/common';
import { MeiliSearchConfigService } from '../../config/meilisearch/config.service';
import { Meilisearch } from 'meilisearch';

@Injectable()
export class MeilisearchService {
  private readonly client: Meilisearch;

  constructor(
    private readonly meilisearchConfigService: MeiliSearchConfigService,
  ) {
    this.client = new Meilisearch({
      host: this.meilisearchConfigService.host,
      apiKey: this.meilisearchConfigService.masterKey,
    });
  }

  getClient(): Meilisearch {
    return this.client;
  }
}
