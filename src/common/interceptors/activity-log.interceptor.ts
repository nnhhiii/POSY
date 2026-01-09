import {
  CallHandler,
  ExecutionContext,
  Inject,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { ActivityLogRepository } from '../../models/activity-log/repositories';
import { JwtPayload } from '../../authentication/interfaces';
import { ActivityLog } from '../../models/activity-log/types';
import { Request } from 'express';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';

@Injectable()
export class ActivityLogInterceptor implements NestInterceptor {
  @Inject(WINSTON_MODULE_NEST_PROVIDER)
  private readonly logger: import('winston').Logger;

  constructor(private readonly activityLogRepository: ActivityLogRepository) {}

  intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Observable<any> | Promise<Observable<any>> {
    const request: Request = context.switchToHttp().getRequest();
    const { method, url, user } = request;
    const handler = context.getHandler().name;

    return next.handle().pipe(
      tap(() => {
        void (async () => {
          if (!user) {
            this.logger.debug(
              'ActivityLogInterceptor - ' +
                'No authenticated user found, skipping log.',
            );
            return;
          }

          const { id, name } = this.extractEntityInfo(url);
          const action = `${method}_${handler}`.toUpperCase();
          const userAgent = request['device'] as string;

          const log = await this.activityLogRepository.create({
            userId: (user as JwtPayload).sub,
            action,
            entity: name,
            entityId: id,
            ipAddress: request.ip,
            userAgent,
          } as ActivityLog);

          this.logger.debug(
            `ActivityLogInterceptor - Created log: ${JSON.stringify(log)}`,
          );
        })();
      }),
    );
  }

  private extractEntityInfo(url: string) {
    const parts = url.split('/').filter(Boolean);
    return {
      id: parts[1] || null,
      name: (parts[0] || 'unknown').toUpperCase(),
    };
  }
}
