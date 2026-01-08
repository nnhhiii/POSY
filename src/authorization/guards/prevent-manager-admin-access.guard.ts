import {
  Injectable,
  CanActivate,
  ExecutionContext,
  BadRequestException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PREVENT_MANAGER_ADMIN_ACCESS_KEY } from '../../common/decorators';
import { Role } from '../../common/enums';
import { JwtPayload } from '../../authentication/interfaces';
import { GetUsersService } from '../../models/users/get-users/get-users.service';
import { UserNotFoundException } from '../../models/users/exceptions';
import { Request } from 'express';

/**
 * Guard to prevent managers from accessing or modifying admin users.
 *
 * This guard checks if the requesting user is a MANAGER and if they are attempting
 * to perform operations on an ADMIN user. If so, it throws a BadRequestException.
 *
 * The guard uses metadata set by the @PreventManagerAdminAccess decorator to determine
 * which DTO property contains the target user ID.
 *
 * @throws {BadRequestException} If a manager attempts to access an admin user.
 * @throws {BadRequestException} If the target user is not found.
 */
@Injectable()
export class PreventManagerAdminAccessGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private getUsersService: GetUsersService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const userIdParam = this.reflector.getAllAndOverride<string>(
      PREVENT_MANAGER_ADMIN_ACCESS_KEY,
      [context.getHandler(), context.getClass()],
    );

    // If no metadata is set, skip this guard
    if (!userIdParam) {
      return true;
    }

    const request = context.switchToHttp().getRequest<Request>();
    const requesterRole = (request.user as JwtPayload)?.role;

    // If requester is not a manager, allow access (admins can do anything)
    if (requesterRole !== Role.MANAGER.toString()) {
      return true;
    }

    // Get the target user ID from the request body or params
    const targetUserId =
      (request.body as Record<string, unknown>)?.[userIdParam] ||
      request.params?.[userIdParam];

    if (!targetUserId) {
      throw new BadRequestException(
        `User ID parameter '${userIdParam}' not found in request.`,
      );
    }

    try {
      // Check if the target user exists and get their role
      const targetUser = await this.getUsersService.getUserById(
        targetUserId as string,
      );

      // Prevent managers from accessing admin users
      if (targetUser.role === Role.ADMIN.toString()) {
        throw new BadRequestException(
          'Managers are not authorized to perform operations on admin users.',
        );
      }
    } catch (e) {
      if (e instanceof UserNotFoundException) {
        throw new BadRequestException(e.message);
      }
      throw e;
    }

    return true;
  }
}
