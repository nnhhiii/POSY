import { SetMetadata } from '@nestjs/common';

export const PREVENT_MANAGER_ADMIN_ACCESS_KEY = 'preventManagerAdminAccess';

/**
 * Decorator to prevent managers from accessing or modifying admin users.
 * This decorator marks methods that should validate whether a manager is attempting
 * to perform operations on admin users, and automatically blocks such attempts.
 *
 * @param {string} userIdParam - The name of the DTO property that contains the target user ID.
 * @returns {MethodDecorator} A method decorator that sets metadata for the guard to use.
 *
 * @example
 * ```TypeScript
 * @PreventManagerAdminAccess('userId')
 * async updateUser(@Body() dto: UpdateUserDto) {
 *   // Method implementation
 * }
 * ```
 */
export const PreventManagerAdminAccess = (
  userIdParam: string,
): MethodDecorator =>
  SetMetadata(PREVENT_MANAGER_ADMIN_ACCESS_KEY, userIdParam);
