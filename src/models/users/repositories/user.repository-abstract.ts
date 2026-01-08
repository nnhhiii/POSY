import { User } from '../types/user.class';
import { Page } from '../../../common/interfaces';

export abstract class UserRepository {
  /**
   * Finds a user by their unique identifier.
   *
   * @param id - The unique identifier of the user.
   * @returns A promise that resolves to the user if found, otherwise null.
   */
  abstract findById(id: string): Promise<User | null>;

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
   * Updates a user's information by their unique identifier.
   *
   * @param userId - The unique identifier of the user to update.
   * @param updateData - Partial user data to update. The 'id' field will be ignored if present.
   * @returns A promise that resolves to the updated user.
   */
  abstract updateUserById(
    userId: string,
    updateData: Partial<User>,
  ): Promise<User>;

  /**
   * Creates a new user in the repository.
   *
   * @param user - The user entity to create.
   * @returns A promise that resolves to the created user.
   */
  abstract createUser(user: User): Promise<User>;

  /**
   * Soft deletes a user by their unique identifier.
   *
   * @param userId - The unique identifier of the user to delete.
   * @returns A promise that resolves when the user has been soft deleted.
   */
  abstract deleteUserById(userId: string): Promise<void>;

  /**
   * Retrieves a paginated list of users from the repository.
   *
   * @param page - The page number to retrieve (optional).
   * @param pageSize - The number of users per page (optional).
   * @param requesterRole - The role of the user making the request (optional). Used to filter results by role.
   * @returns A promise that resolves to a paginated list of users.
   */
  abstract getUsers(
    page?: number,
    pageSize?: number,
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
