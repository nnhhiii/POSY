import { Injectable } from '@nestjs/common';
import { UserRepository } from '../repositories';
import { User } from '@prisma/client';
import { UserNotFoundException } from '../exceptions';
import { hash } from '../../../common/utilities/hash.util';
import { UnnecessaryOperationException } from '../../../common/exceptions';

@Injectable()
export class UpdateUserService {
  constructor(private userRepository: UserRepository) {}

  /**
   * Updates a user's information in the database.
   *
   * @param {string} id - The unique identifier of the user to be updated.
   * @param {Partial<User>} updatedData - An object containing the fields to update for the user. Must include the user's id.
   * @returns {Promise<User>} The updated user object.
   * @throws {Error} If the update operation fails or the user id is not provided.
   */
  async updateUser(id: string, updatedData: Partial<User>) {
    return this.userRepository.update(id, updatedData);
  }

  /**
   * Toggles the 'isActive' status of a user by their user ID.
   *
   * @param {string} userId - The unique identifier of the user whose active status will be toggled.
   * @returns {Promise<void>} Resolves when the operation is complete.
   * @throws {UserNotFoundException} If the user with the given ID does not exist.
   */
  async toggleUserActive(userId: string): Promise<void> {
    const user = await this.userRepository.findById(userId);
    if (!user) throw new UserNotFoundException();

    user.isActive = !user.isActive;
    await this.userRepository.update(userId, {
      isActive: user.isActive,
    });
  }

  /**
   * Unlocks a user's account by resetting their failed login attempts and clearing the lockout expiration.
   *
   * This method finds the user by their unique identifier. If the user exists, it resets the `failedLoginAttempts`
   * to 0 and sets `lockoutExpiresAt` to `null`, effectively unlocking the account and allowing the user to attempt
   * to log in again. If the user does not exist, a `UserNotFoundException` is thrown.
   *
   * @param {string} userId - The unique identifier of the user to unlock.
   * @returns {Promise<void>} Resolves when the user's account has been unlocked.
   * @throws {UserNotFoundException} If no user is found with the provided ID.
   * @throws {UnnecessaryOperationException} If the user account is not locked.
   */
  async unlockUser(userId: string): Promise<void> {
    const user = await this.userRepository.findById(userId);
    if (!user) throw new UserNotFoundException();

    if (user.failedLoginAttempts === 0 && !user.lockoutExpiresAt) {
      throw new UnnecessaryOperationException('User account is not locked.');
    }

    await this.userRepository.update(userId, {
      failedLoginAttempts: 0,
      lockoutExpiresAt: null,
    });
  }

  /**
   * Updates the password of a user by their user ID.
   *
   * This method securely hashes the new password and updates the user's passwordHash in the database.
   *
   * @param {string} userId - The unique identifier of the user whose password will be updated.
   * @param {string} newPassword - The new plain-text password to set for the user. This will be hashed before storage.
   * @returns {Promise<void>} Resolves when the password update operation is complete.
   * @throws {Error} If the update operation fails or the user does not exist.
   */
  async updatePassword(userId: string, newPassword: string): Promise<void> {
    const newPasswordHash = await hash(newPassword);
    await this.userRepository.update(userId, {
      passwordHash: newPasswordHash,
    });
  }
}
