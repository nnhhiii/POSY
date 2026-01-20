import { Injectable } from '@nestjs/common';
import { UserRepository } from '../repositories';
import { User } from '../types/user.class';
import { UserNotFoundException } from '../exceptions';

@Injectable()
export class GetUsersService {
  constructor(private userRepository: UserRepository) {}

  /**
   * Retrieves a user by their unique ID.
   *
   * @param {string} userId - The unique identifier of the user to retrieve.
   * @returns {Promise<User>} A promise that resolves to the user domain object.
   * @throws {UserNotFoundException} If the user with the given ID does not exist.
   */
  async getUserById(userId: string): Promise<User> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new UserNotFoundException({ id: userId });
    }
    return user;
  }

  /**
   * Retrieves a paginated list of users from the repository.
   *
   * @async
   * @param {number} page - The current page number (1-based index).
   * @param {number} pageSize - The number of users to retrieve per page.
   * @param {string} requesterRole - The role of the user making the request (to filter results).
   * @returns {Promise<Array<User>>} A promise that resolves to an array of user entities for the specified page.
   * @throws {Error} If there is an error retrieving users from the repository.
   */
  async getAllUsers(page?: number, pageSize?: number, requesterRole?: string) {
    return await this.userRepository.getUsers(page, pageSize, requesterRole);
  }
}
