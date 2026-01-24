import { Injectable } from '@nestjs/common';
import { User } from '../types/user.class';
import { UserRepository } from '../repositories';

@Injectable()
export class CreateUserService {
  constructor(private userRepository: UserRepository) {}

  /**
   * Creates a new user in the system.
   *
   * @param {User} user - The user entity containing user details to be created.
   * @returns {Promise<User>} A promise that resolves to the created user entity.
   * @throws {DuplicateEntryException} If a user with the same unique fields already exists.
   * @throws {RelatedRecordNotFoundException} If related records required for user creation are not found.
   */
  async createUser(user: User): Promise<User> {
    return this.userRepository.create(user);
  }
}
