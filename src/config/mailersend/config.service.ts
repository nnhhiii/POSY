import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MailerSendConfigService {
  constructor(private configService: ConfigService) {}

  get apiKey(): string {
    return this.configService.get<string>('mailersend.api_key')!;
  }

  get from(): string {
    return this.configService.get<string>('mailersend.from')!;
  }
}
