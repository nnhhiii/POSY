import { Inject, Injectable } from '@nestjs/common';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { UserRepository } from '../../models/users/repositories';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class ResetPasswordCleanupService {
  @Inject(WINSTON_MODULE_NEST_PROVIDER)
  private readonly logger: import('winston').Logger;

  constructor(private readonly userRepository: UserRepository) {}

  @Cron(CronExpression.EVERY_HOUR)
  async cleanupExpiredResetCredentials() {
    const now = new Date();
    const affected =
      await this.userRepository.clearExpiredResetCredentials(now);
    this.logger.notice(`Expired reset credentials: ${affected} users updated`);
  }
}
