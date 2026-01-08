import { Injectable, OnModuleDestroy } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleDestroy {
  private readonly client: Redis;

  constructor() {
    this.client = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: 6379,
    });
  }

  publish(channel: string, message: string) {
    return this.client.publish(channel, message);
  }

  onModuleDestroy() {
    this.client.quit();
  }
}
