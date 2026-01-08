import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { AccessControlService } from '../access-control/access-control.service';
import { Reflector } from '@nestjs/core';
import { Role } from '../../common/enums';
import { ROLE_KEY } from '../../common/decorators';
import { JwtPayload } from '../../authentication/interfaces';
import { Request } from 'express';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';

@Injectable()
export class RoleGuard implements CanActivate {
  @Inject(WINSTON_MODULE_NEST_PROVIDER)
  private readonly logger: import('winston').Logger;

  constructor(
    private reflector: Reflector,
    private accessControlService: AccessControlService,
  ) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLE_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    this.logger.debug(
      `RoleGuard - Required roles: ${JSON.stringify(requiredRoles)}`,
    );

    const request: Request = context.switchToHttp().getRequest();
    const user = request.user as JwtPayload;

    this.logger.debug(`RoleGuard - User from request: ${JSON.stringify(user)}`);

    if (!user) {
      this.logger.warn('RoleGuard - No user found in request');
      return false;
    }

    const currentRole = user?.role;

    this.logger.debug(`RoleGuard - Current user role: ${currentRole}`);

    if (!requiredRoles || requiredRoles.length === 0) {
      this.logger.debug('RoleGuard - No required roles, granting access');
      return true;
    }

    for (const requireRole of requiredRoles) {
      this.logger.debug(
        `RoleGuard - Checking if ${currentRole} is authorized for ${requireRole}`,
      );
      if (
        this.accessControlService.isAuthorized({
          currentRole: currentRole as Role,
          requiredRole: requireRole,
        })
      ) {
        this.logger.debug(`RoleGuard - Access granted for role ${requireRole}`);
        return true;
      }
    }

    this.logger.warn(
      `RoleGuard - Access denied. User role ${currentRole} not authorized for any of: ${JSON.stringify(requiredRoles)}`,
    );
    return false;
  }
}
