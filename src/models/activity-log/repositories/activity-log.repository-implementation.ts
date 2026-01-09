import { Injectable } from '@nestjs/common';
import { ActivityLogRepository } from './activity-log.repository-abstract';
import { ActivityLog } from '../types';
import { ActivityLogMapper } from '../types';
import { Page, PaginationParams } from '../../../common/interfaces';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../providers/prisma/prisma.service';
import { ActivityLogFilters, ActivityLogPaginationParams } from '../interfaces';
import { ActivityLogGateway } from '../activity-log.gateway';
import { paginationConfig } from '../../../common/config';

const { page: defaultPage, pageSize: defaultPageSize } =
  paginationConfig.default;

@Injectable()
export class ActivityLogRepositoryImpl implements ActivityLogRepository {
  constructor(
    private readonly prisma: PrismaService,
    private readonly gateway: ActivityLogGateway,
  ) {}

  async create(activityLog: ActivityLog): Promise<ActivityLog> {
    const prismaData = ActivityLogMapper.toPrisma(activityLog);
    const created = await this.prisma.activityLog.create({
      data: prismaData,
    });

    const domainLog = ActivityLogMapper.toDomain(created);

    // Emit the log in real-time to connected WebSocket clients
    this.gateway.emitLogToAdmins(domainLog);

    return domainLog;
  }

  async findById(id: string): Promise<ActivityLog | null> {
    const log = await this.prisma.activityLog.findUnique({
      where: { id },
    });
    return log ? ActivityLogMapper.toDomain(log) : null;
  }

  async findByUserId(
    userId: string,
    paginationParams: PaginationParams = {
      page: defaultPage,
      pageSize: defaultPageSize,
    },
  ): Promise<Page<ActivityLog>> {
    const { page = defaultPage, pageSize = defaultPageSize } = paginationParams;
    const skip = (page - 1) * pageSize;
    const [items, total] = await Promise.all([
      this.prisma.activityLog.findMany({
        where: { user_id: userId },
        skip,
        take: pageSize,
        orderBy: { created_at: 'desc' },
      }),
      this.prisma.activityLog.count({
        where: { user_id: userId },
      }),
    ]);

    return {
      items: items.map(ActivityLogMapper.toDomain),
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  async findByEntity(
    entity: string,
    entityId: string,
    paginationParams: PaginationParams = {
      page: defaultPage,
      pageSize: defaultPageSize,
    },
  ): Promise<Page<ActivityLog>> {
    const { page = defaultPage, pageSize = defaultPageSize } = paginationParams;
    const skip = (page - 1) * pageSize;
    const [items, total] = await Promise.all([
      this.prisma.activityLog.findMany({
        where: {
          entity,
          entity_id: entityId,
        },
        skip,
        take: pageSize,
        orderBy: { created_at: 'desc' },
      }),
      this.prisma.activityLog.count({
        where: {
          entity,
          entity_id: entityId,
        },
      }),
    ]);

    return {
      items: items.map(ActivityLogMapper.toDomain),
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  async findByAction(
    action: string,
    paginationParams: PaginationParams = {
      page: defaultPage,
      pageSize: defaultPageSize,
    },
  ): Promise<Page<ActivityLog>> {
    const { page = defaultPage, pageSize = defaultPageSize } = paginationParams;
    const skip = (page - 1) * pageSize;
    const [items, total] = await Promise.all([
      this.prisma.activityLog.findMany({
        where: { action },
        skip,
        take: pageSize,
        orderBy: { created_at: 'desc' },
      }),
      this.prisma.activityLog.count({
        where: { action },
      }),
    ]);

    return {
      items: items.map(ActivityLogMapper.toDomain),
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  async findByDateRange(
    startDate: Date,
    endDate: Date,
    paginationParams: PaginationParams = {
      page: defaultPage,
      pageSize: defaultPageSize,
    },
  ): Promise<Page<ActivityLog>> {
    const { page = defaultPage, pageSize = defaultPageSize } = paginationParams;
    const skip = (page - 1) * pageSize;
    const [items, total] = await Promise.all([
      this.prisma.activityLog.findMany({
        where: {
          created_at: {
            gte: startDate,
            lte: endDate,
          },
        },
        skip,
        take: pageSize,
        orderBy: { created_at: 'desc' },
      }),
      this.prisma.activityLog.count({
        where: {
          created_at: {
            gte: startDate,
            lte: endDate,
          },
        },
      }),
    ]);

    return {
      items: items.map(ActivityLogMapper.toDomain),
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  async findAll(
    params: ActivityLogPaginationParams = {
      page: defaultPage,
      pageSize: defaultPageSize,
    },
  ): Promise<Page<ActivityLog>> {
    const { page = defaultPage, pageSize = defaultPageSize, filters } = params;
    const skip = (page - 1) * pageSize;
    const where = this.buildWhereClause(filters);

    const [items, total] = await Promise.all([
      this.prisma.activityLog.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { created_at: 'desc' },
      }),
      this.prisma.activityLog.count({ where }),
    ]);

    return {
      items: items.map(ActivityLogMapper.toDomain),
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  async findRecent(
    paginationParams: PaginationParams = {
      page: defaultPage,
      pageSize: defaultPageSize,
    },
  ): Promise<Page<ActivityLog>> {
    const { page = defaultPage, pageSize = defaultPageSize } = paginationParams;
    const skip = (page - 1) * pageSize;
    const [items, total] = await Promise.all([
      this.prisma.activityLog.findMany({
        skip,
        take: pageSize,
        orderBy: { created_at: 'desc' },
      }),
      this.prisma.activityLog.count(),
    ]);

    return {
      items: items.map(ActivityLogMapper.toDomain),
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  // async countByUserId(userId: string): Promise<number> {
  //   return this.prisma.activityLog.count({
  //     where: { user_id: userId },
  //   });
  // }
  //
  // async countByAction(action: string): Promise<number> {
  //   return this.prisma.activityLog.count({
  //     where: { action },
  //   });
  // }

  private buildWhereClause(
    filters?: ActivityLogFilters,
  ): Prisma.ActivityLogWhereInput {
    if (!filters) return {};

    const where: Prisma.ActivityLogWhereInput = {};

    if (filters.userId) {
      where.user_id = filters.userId;
    }
    if (filters.action) {
      where.action = filters.action;
    }
    if (filters.entity) {
      where.entity = filters.entity;
    }
    if (filters.entityId) {
      where.entity_id = filters.entityId;
    }
    if (filters.startDate || filters.endDate) {
      where.created_at = {};
      if (filters.startDate) {
        where.created_at.gte = filters.startDate;
      }
      if (filters.endDate) {
        where.created_at.lte = filters.endDate;
      }
    }

    return where;
  }
}
