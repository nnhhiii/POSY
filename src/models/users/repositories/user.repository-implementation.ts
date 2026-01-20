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
import { buildPage } from 'src/common/utilities/pagination.util';

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
   * @param {string} userId - The unique identifier of the user to update.
   * @param {Partial<User>} updateData - Partial user data to update. The 'id' field will be ignored if present.
   * @returns {Promise<User>} The updated user domain object.
   * @throws {UserNotFoundException} If the user with the given ID does not exist.
   * @throws {DuplicateEntryException} If a user with a unique field already exists.
   * @throws {Error} If the update operation fails for other reasons.
   */
  async updateUserById(
    userId: string,
    updateData: Partial<User>,
  ): Promise<User> {
    const user = await this.findById(userId);
    if (!user) throw new UserNotFoundException({ id: userId });
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

    try {
      return await this.prismaService.user
        .update({
          where: { id: userId },
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
   * @param {User} user - The user domain object to create.
   * @returns {Promise<User>} The created user domain object.
   * @throws {DuplicateEntryException} If a user with a unique field already exists.
   * @throws {Error} If the creation operation fails for other reasons.
   */
  async createUser(user: User): Promise<User> {
    const prismaUser = UserMapper.toPrisma(user);
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
  async deleteUserById(id: string): Promise<void> {
    // Implement soft delete by setting is_deleted to true
    const user = await this.findById(id);
    if (!user) throw new UserNotFoundException({ id });
    await this.updateUserById(id, { isDeleted: true, deletedAt: new Date() });
  }

  /**
   * Retrieves a paginated list of users from the database.
   *
   * @param {number} [page=this.pageDefault] - The page number to retrieve (1-based index). Defaults to the configured default page.
   * @param {number} [pageSize=this.pageSizeDefault] - The number of users per page. Defaults to the configured default page size.
   * @param {string} [requesterRole] - The role of the user making the request. Managers cannot see admin users.
   * @returns {Promise<Page<User>>} A Page object containing the users, pagination info, and total counts.
   */
  async getUsers(
    page: number = this.pageDefault,
    pageSize: number = this.pageSizeDefault,
    requesterRole?: string,
  ): Promise<Page<User>> {
    const whereClause: { role?: { not: string } } = {};

    if (requesterRole === 'MANAGER') {
      whereClause.role = { not: 'ADMIN' };
    }

    const [users, total] = await this.prismaService.$transaction([
      this.prismaService.user.findMany({
        where: whereClause,
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prismaService.user.count({ where: whereClause }),
    ]);

    return buildPage(users.map(UserMapper.toDomain), page, pageSize, total);
  }

  async clearExpiredResetCredentials(date: Date): Promise<number> {
    return (
      (await this.clearExpiredResetCodes(date)) +
      (await this.clearExpiredResetTokens(date))
    );
  }

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
