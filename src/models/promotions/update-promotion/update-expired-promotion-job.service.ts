import { Inject, Injectable } from '@nestjs/common';
import { PromotionRepository } from '../repositories';
import { Cron, CronExpression } from '@nestjs/schedule';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';

@Injectable()
export class UpdateExpiredPromotionJobService {
  @Inject(WINSTON_MODULE_NEST_PROVIDER)
  private readonly logger: import('winston').Logger;

  constructor(private readonly promotionRepository: PromotionRepository) {}

  @Cron(CronExpression.EVERY_HOUR)
  async updateExpiredPromotions() {
    const now = new Date();
    const affected =
      await this.promotionRepository.updateExpiredPromotions(now);
    this.logger.notice(`Expired promotions updated: ${affected} promotions`);
  }
}
