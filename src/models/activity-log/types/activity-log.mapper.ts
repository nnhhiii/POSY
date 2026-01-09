import { ActivityLog as PrismaActivityLog } from '@prisma/client';
import { ActivityLog as DomainActivityLog } from './activity-log.class';
import { MissingRequireFieldsException } from '../../../common/exceptions';

export class ActivityLogMapper {
  static toDomain(
    this: void,
    prismaActivityLog: PrismaActivityLog,
  ): DomainActivityLog {
    return new DomainActivityLog(
      prismaActivityLog.id,
      prismaActivityLog.user_id,
      prismaActivityLog.action,
      prismaActivityLog.entity,
      prismaActivityLog.entity_id,
      prismaActivityLog.changes,
      prismaActivityLog.ip_address,
      prismaActivityLog.user_agent,
      prismaActivityLog.created_at,
    );
  }

  static toPrisma(this: void, domainActivityLog: DomainActivityLog) {
    if (!domainActivityLog.userId || !domainActivityLog.action) {
      throw new MissingRequireFieldsException();
    }
    return {
      user_id: domainActivityLog.userId,
      action: domainActivityLog.action,
      entity: domainActivityLog.entity ?? null,
      entity_id: domainActivityLog.entityId ?? null,
      changes: (domainActivityLog.changes as object) ?? null,
      ip_address: domainActivityLog.ipAddress ?? null,
      user_agent: domainActivityLog.userAgent ?? null,
      created_at: domainActivityLog.createdAt ?? new Date(),
      ...(domainActivityLog.id ? { id: domainActivityLog.id } : {}),
    };
  }
}
