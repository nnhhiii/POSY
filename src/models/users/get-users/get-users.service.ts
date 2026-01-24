import { Injectable } from '@nestjs/common';
import { UserRepository } from '../repositories';
import { User } from '../types/user.class';
import { UserNotFoundException } from '../exceptions';
import { UserQueryParams } from '../interfaces';
import { Page } from '../../../common/interfaces';

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
   * Retrieves a paginated list of users with advanced filtering and sorting.
   *
   * @param {UserQueryParams} params - The query parameters for filtering, sorting, and pagination.
   * @param {string} [requesterRole] - The role of the user making the request (to filter results).
   * @returns {Promise<Page<User>>} A promise that resolves to a paginated list of users.
   */
  async getAll(
    params: UserQueryParams,
    requesterRole?: string,
  ): Promise<Page<User>> {
    return this.userRepository.getAllPaged(params, requesterRole);
  }
}
