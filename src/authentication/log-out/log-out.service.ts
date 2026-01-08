import { Injectable } from '@nestjs/common';
import { UserRepository } from '../../models/users/repositories';
import { UserNotFoundException } from '../../models/users/exceptions';

@Injectable()
export class LogOutService {
  constructor(private userRepository: UserRepository) {}

  /**
   * Logs out a user by invalidating their refresh token.
   *
   * This method finds the user by their unique identifier. If the user exists, it sets the user's
   * refreshTokenHash to null in the database, effectively invalidating any existing refresh tokens
   * and logging the user out from all sessions. If the user does not exist, a UserNotFoundException is thrown.
   *
   * @param {string} userId - The unique identifier of the user to log out.
   * @returns {Promise<void>} Resolves when the logout operation is complete.
   * @throws {UserNotFoundException} If the user with the given ID does not exist in the database.
   */
  async logout(userId: string) {
    const user = await this.userRepository.findById(userId);
    if (!user) throw new UserNotFoundException();
    await this.userRepository.updateUserByEmail(user.email, {
      refreshTokenHash: null,
    });
  }
}
