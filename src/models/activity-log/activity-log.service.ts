import { Injectable } from '@nestjs/common';
import {
  ActivityLogPaginationParams,
  ActivityLogRepository,
} from './repositories';
import { PaginationParams } from '../../common/interfaces';

@Injectable()
export class ActivityLogService {
  constructor(private readonly activityLogRepository: ActivityLogRepository) {}

  async findAll(params: ActivityLogPaginationParams) {
    return await this.activityLogRepository.findAll(params);
  }

  async findRecent(params: PaginationParams) {
    return await this.activityLogRepository.findRecent(params);
  }

  async findByUserId(userId: string) {
    return await this.activityLogRepository.findById(userId);
  }
}
