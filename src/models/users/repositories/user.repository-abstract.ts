import { User } from '../types/user.class';
import { BaseRepository, Page } from '../../../common/interfaces';
import { UserQueryParams } from '../interfaces';

export abstract class UserRepository implements BaseRepository<User> {
  /**
   * Creates a new user in the repository.
   *
   * @param entity - The user entity to create.
   * @returns A promise that resolves to the created user.
   */
  abstract create(entity: User): Promise<User>;

  /**
   * Finds a user by their unique identifier.
   *
   * @param id - The unique identifier of the user.
   * @returns A promise that resolves to the user if found, otherwise null.
   */
  abstract findById(id: string): Promise<User | null>;

  /**
   * Soft deletes a user by their unique identifier.
   *
   * @param id - The unique identifier of the user to delete.
   * @returns A promise that resolves when the user has been soft deleted.
   */
  abstract delete(id: string): Promise<void>;

  /**
   * Updates a user's information by their unique identifier.
   *
   * @param id - The unique identifier of the user to update.
   * @param entity - Partial user data to update. The 'id' field will be ignored if present.
   * @returns A promise that resolves to the updated user.
   */
  abstract update(id: string, entity: Partial<User>): Promise<User>;

  /**
   * Finds a user by their email address.
   *
   * @param email - The email address of the user.
   * @returns A promise that resolves to the user if found, otherwise null.
   */
  abstract findByEmail(email: string): Promise<User | null>;

  /**
   * Finds a user by their username.
   *
   * @param username - The username of the user.
   * @returns A promise that resolves to the user if found, otherwise null.
   */
  abstract findByUsername(username: string): Promise<User | null>;

  /**
   * Updates a user's information by their email address.
   *
   * @param email - The email address of the user to update.
   * @param updateData - Partial user data to update. The 'id' field will be ignored if present.
   * @returns A promise that resolves to the updated user.
   */
  abstract updateUserByEmail(
    email: string,
    updateData: Partial<User>,
  ): Promise<User>;

  /**
   * Retrieves a paginated list of users based on query parameters.
   *
   * @param params - The query parameters for pagination, filtering, and sorting.
   * @param requesterRole - The role of the user making the request (optional). Used to filter results by role.
   * @returns A promise that resolves to a paginated list of users.
   */
  abstract getAllPaged(
    params: UserQueryParams,
    requesterRole?: string,
  ): Promise<Page<User>>;

  /**
   * Removes or nullifies expired reset credentials (`resetToken`, `resetCode`) for users.
   *
   * This method should be called periodically to clean up expired password reset tokens and codes.
   * It checks each user's reset credential expiration fields and clears them if they have expired.
   *
   * @param date - The current date and time used to compare against expiration fields.
   * @returns A promise that resolves to the number of users whose expired credentials were cleaned up.
   *
   * @example
   * // Run cleanup job
   * const cleanedCount = await userRepository.cleanupExpiredResetCredentials(new Date());
   * console.log(`Cleaned up credentials for ${cleanedCount} users.`);
   */
  abstract clearExpiredResetCredentials(date: Date): Promise<number>;
}
