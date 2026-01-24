import { Injectable } from '@nestjs/common';
import { User } from '../types/user.class';
import { PrismaService } from '../../../providers/prisma/prisma.service';
import { UserMapper } from '../types/user.mapper';
import { UserRepository } from './user.repository-abstract';
import { UserNotFoundException } from '../exceptions';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/client';
import { DuplicateEntryException } from '../../../common/exceptions';
import { camelCaseToSnakeCase } from '../../../common/utilities/string.util';
import { Page } from '../../../common/interfaces';
import { paginationConfig } from '../../../common/config';
import { UserOrderBy, UserQueryFilter, UserQueryParams } from '../interfaces';
import { Prisma } from '@prisma/client';
import { Role } from '../../../common/enums';

@Injectable()
export class UserRepositoryImpl implements UserRepository {
  private readonly pageDefault = paginationConfig.default.page;
  private readonly pageSizeDefault = paginationConfig.default.pageSize;

  constructor(private readonly prismaService: PrismaService) {}

  /**
   * Finds a user by their unique ID.
   *
   * @param id - The unique identifier of the user.
   * @returns A promise that resolves to the user domain object if found, otherwise null.
   */
  async findById(id: string): Promise<User | null> {
    const prismaUser = await this.prismaService.user.findUnique({
      where: { id },
    });

    return prismaUser ? UserMapper.toDomain(prismaUser) : null;
  }

  /**
   * Finds a user by their email address.
   *
   * @param email - The email address of the user.
   * @returns A promise that resolves to the user domain object if found, otherwise null.
   */
  async findByEmail(email: string): Promise<User | null> {
    const prismaUser = await this.prismaService.user.findUnique({
      where: { email },
    });

    return prismaUser ? UserMapper.toDomain(prismaUser) : null;
  }

  /**
   * Finds a user by their username.
   *
   * @param username - The username of the user.
   * @returns A promise that resolves to the user domain object if found, otherwise null.
   */
  async findByUsername(username: string): Promise<User | null> {
    const prismaUser = await this.prismaService.user.findUnique({
      where: { username },
    });

    return prismaUser ? UserMapper.toDomain(prismaUser) : null;
  }

  /**
   * Updates a user's information by their email address.
   * Throws UserNotFoundException if the user does not exist.
   * @param email - The email address of the user to update.
   * @param updateData - Partial user data to update.
   * @returns The updated user domain object.
   */
  async updateUserByEmail(
    email: string,
    updateData: Partial<User>,
  ): Promise<User> {
    const user = await this.findByEmail(email);
    if (!user) throw new UserNotFoundException({ email });
    // Remove 'id' from updateData if present
    const dataWithoutId = { ...updateData };
    delete dataWithoutId.id;

    // Map camelCase keys to snake_case for Prisma compatibility
    const dataSnakeCase = Object.entries(dataWithoutId).reduce(
      (acc, [key, value]) => {
        const snakeKey = camelCaseToSnakeCase(key);
        acc[snakeKey] = value;
        return acc;
      },
      {} as Record<string, any>,
    );

    const updatedPrismaUser = await this.prismaService.user.update({
      where: { email },
      data: dataSnakeCase,
    });

    return UserMapper.toDomain(updatedPrismaUser);
  }

  /**
   * Updates a user's information by their unique ID.
   * Throws UserNotFoundException if the user does not exist.
   *
   * @param {string} id - The unique identifier of the user to update.
   * @param {Partial<User>} entity - Partial user data to update. The 'id' field will be ignored if present.
   * @returns {Promise<User>} The updated user domain object.
   * @throws {UserNotFoundException} If the user with the given ID does not exist.
   * @throws {DuplicateEntryException} If a user with a unique field already exists.
   * @throws {Error} If the update operation fails for other reasons.
   */
  async update(id: string, entity: Partial<User>): Promise<User> {
    const user = await this.findById(id);
    if (!user) throw new UserNotFoundException({ id });
    // Remove 'id' from entity if present
    const dataWithoutId = { ...entity };
    delete dataWithoutId.id;

    // Map camelCase keys to snake_case for Prisma compatibility
    const dataSnakeCase = Object.entries(dataWithoutId).reduce(
      (acc, [key, value]) => {
        const snakeKey = camelCaseToSnakeCase(key);
        acc[snakeKey] = value;
        return acc;
      },
      {} as Record<string, any>,
    );

    try {
      return await this.prismaService.user
        .update({
          where: { id },
          data: dataSnakeCase,
        })
        .then(UserMapper.toDomain);
    } catch (e) {
      if (e instanceof PrismaClientKnownRequestError) {
        if (e.code === 'P2002') {
          throw new DuplicateEntryException(
            'User with provided unique field already exists',
          );
        }
      }
      throw e;
    }
  }

  /**
   * Creates a new user in the database.
   *
   * @param {User} entity - The user domain object to create.
   * @returns {Promise<User>} The created user domain object.
   * @throws {DuplicateEntryException} If a user with a unique field already exists.
   * @throws {Error} If the creation operation fails for other reasons.
   */
  async create(entity: User): Promise<User> {
    const prismaUser = UserMapper.toPrisma(entity);
    try {
      return await this.prismaService.user
        .create({ data: prismaUser })
        .then(UserMapper.toDomain);
    } catch (e) {
      if (e instanceof PrismaClientKnownRequestError) {
        if (e.code === 'P2002') {
          throw new DuplicateEntryException(
            'User with provided unique field already exists',
          );
        }
      }
      throw e;
    }
  }

  /**
   * Soft deletes a user by their unique ID by setting the `is_deleted` flag to true.
   *
   * @param {string} id - The unique identifier of the user to delete.
   * @returns {Promise<void>} Resolves when the user has been soft deleted.
   * @throws {UserNotFoundException} If the user with the specified ID does not exist.
   *
   * @remarks
   * This method performs a soft delete, meaning the user record remains in the database
   * but is marked as deleted. The `isDeleted` property is set to `true` instead of removing
   * the record permanently.
   */
  async delete(id: string): Promise<void> {
    // Implement soft delete by setting is_deleted to true
    const user = await this.findById(id);
    if (!user) throw new UserNotFoundException({ id });
    await this.update(id, { isDeleted: true, deletedAt: new Date() });
  }

  /**
   * Retrieves a paginated list of users based on query parameters.
   *
   * @param {UserQueryParams} params - The query parameters for pagination, filtering, and sorting.
   *   - page: The page number to retrieve (default is from config).
   *   - pageSize: The number of items per page (default is from config).
   *   - filter: Filtering options for users (see UserQueryFilter).
   *   - orderBy: Array of sorting options for specific fields and direction.
   * @param {string} [requesterRole] - The role of the user making the request. Managers cannot see admin users.
   * @returns {Promise<Page<User>>} A promise that resolves to a paginated result containing users and pagination info.
   *
   * @example
   * // Search for users with pagination and filtering
   * const params = {
   *   page: 1,
   *   pageSize: 20,
   *   filter: { query: 'john', role: 'STAFF', isActive: true },
   *   orderBy: [{ field: 'fullName', direction: 'asc' }]
   * };
   * const page = await userRepository.getAllPaged(params, 'ADMIN');
   */
  async getAllPaged(
    params: UserQueryParams,
    requesterRole?: string,
  ): Promise<Page<User>> {
    const {
      page = this.pageDefault,
      pageSize = this.pageSizeDefault,
      filter,
      orderBy: pairs,
    } = params;

    const where = this.buildWhereClause(filter, requesterRole);
    const orderBy = this.buildOrderByClause(pairs);

    const [items, total] = await Promise.all([
      this.prismaService.user.findMany({
        where,
        orderBy,
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prismaService.user.count({ where }),
    ]);

    return {
      items: items.map((u) => UserMapper.toDomain(u)),
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  /**
   * Builds the Prisma orderBy clause from the provided order by pairs.
   *
   * @param {UserOrderBy} [pairs] - The order by pairs specifying fields and directions.
   * @returns {Prisma.UserOrderByWithRelationInput | Prisma.UserOrderByWithRelationInput[]} The Prisma orderBy clause for sorting.
   */
  private buildOrderByClause(
    pairs?: UserOrderBy,
  ):
    | Prisma.UserOrderByWithRelationInput
    | Prisma.UserOrderByWithRelationInput[] {
    if (!pairs || pairs.length === 0) {
      return { created_at: 'desc' };
    }

    const mapping: Record<string, string> = {
      fullName: 'full_name',
      email: 'email',
      username: 'username',
      role: 'role',
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    };

    return pairs.map((pair) => {
      const snakeField = mapping[pair.field] || pair.field;
      return { [snakeField]: pair.direction };
    });
  }

  /**
   * Builds the Prisma where clause from the provided user query filters.
   *
   * @param {UserQueryFilter} [filters] - The filters to apply to the user query.
   * @param {string} [requesterRole] - The role of the user making the request. Managers cannot see admin users.
   * @returns {Prisma.UserWhereInput} The Prisma where clause for filtering users.
   */
  private buildWhereClause(
    filters?: UserQueryFilter,
    requesterRole?: string,
  ): Prisma.UserWhereInput {
    const where: Prisma.UserWhereInput = {};

    // Manager role restriction
    if (requesterRole === 'MANAGER') {
      where.role = { not: 'ADMIN' };
    }

    if (!filters) return where;

    // Search query - search in fullName, email, and username
    if (filters.query) {
      where.OR = [
        {
          full_name: {
            contains: filters.query,
            mode: 'insensitive',
          },
        },
        {
          email: {
            contains: filters.query,
            mode: 'insensitive',
          },
        },
        {
          username: {
            contains: filters.query,
            mode: 'insensitive',
          },
        },
      ];
    }

    // Role filter
    if (filters.role) {
      // If manager is requesting and trying to filter by ADMIN, override
      if (
        requesterRole === Role.MANAGER.toString() &&
        filters.role === Role.ADMIN.toString()
      ) {
        // Keep the existing role restriction (not ADMIN)
      } else if (requesterRole === Role.MANAGER.toString()) {
        // Manager requesting non-ADMIN role
        where.role = filters.role;
      } else {
        // Admin or no restriction
        where.role = filters.role;
      }
    }

    // Active status filter
    if (filters.isActive !== undefined) {
      where.is_active = filters.isActive;
    }

    // Deleted status filter
    if (filters.isDeleted !== undefined) {
      where.is_deleted = filters.isDeleted;
    }

    return where;
  }

  /**
   * Removes or nullifies expired reset credentials (`resetToken`, `resetCode`) for users.
   *
   * This method should be called periodically to clean up expired password reset tokens and codes.
   * It checks each user's reset credential expiration fields and clears them if they have expired.
   *
   * @param {Date} date - The current date and time used to compare against expiration fields.
   * @returns {Promise<number>} The number of users whose expired credentials were cleaned up.
   *
   * @example
   * // Run cleanup job
   * const cleanedCount = await userRepository.clearExpiredResetCredentials(new Date());
   * console.log(`Cleaned up credentials for ${cleanedCount} users.`);
   */
  async clearExpiredResetCredentials(date: Date): Promise<number> {
    return (
      (await this.clearExpiredResetCodes(date)) +
      (await this.clearExpiredResetTokens(date))
    );
  }

  /**
   * Removes or nullifies expired reset tokens for users.
   *
   * This method sets `reset_token` and `reset_token_exp` to null for all users whose `reset_token_exp` is less than the provided date.
   *
   * @param {Date} date - The current date and time used to compare against the reset token expiration field.
   * @returns {Promise<number>} The number of users whose expired reset tokens were cleared.
   *
   * @example
   * // Clear expired reset tokens
   * const affected = await userRepository.clearExpiredResetTokens(new Date());
   * console.log(`Cleared reset tokens for ${affected} users.`);
   */
  private async clearExpiredResetTokens(date: Date): Promise<number> {
    const affected = await this.prismaService.user.updateMany({
      where: {
        reset_token_exp: { lt: date },
      },
      data: {
        reset_token: null,
        reset_token_exp: null,
      },
    });

    return affected.count;
  }

  /**
   * Removes or nullifies expired reset codes for users.
   *
   * This method sets `reset_code` and `reset_code_exp` to null for all users whose `reset_code_exp` is less than the provided date.
   *
   * @param {Date} date - The current date and time used to compare against the reset code expiration field.
   * @returns {Promise<number>} The number of users whose expired reset codes were cleared.
   *
   * @example
   * // Clear expired reset codes
   * const affected = await userRepository.clearExpiredResetCodes(new Date());
   * console.log(`Cleared reset codes for ${affected} users.`);
   */
  private async clearExpiredResetCodes(date: Date): Promise<number> {
    const affected = await this.prismaService.user.updateMany({
      where: {
        reset_code_exp: { lt: date },
      },
      data: {
        reset_code: null,
        reset_code_exp: null,
      },
    });

    return affected.count;
  }
}
