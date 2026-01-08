import { Injectable } from '@nestjs/common';
import { PrismaPg } from '@prisma/adapter-pg';
import { DatabaseConfigService } from '../../config/database/config.service';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient {
  constructor(databaseConfigService: DatabaseConfigService) {
    const connectionString = databaseConfigService.url;
    const adapter = new PrismaPg({ connectionString });
    super({ adapter });
  }
}
