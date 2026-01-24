import { Injectable } from '@nestjs/common';
import { UserRepository } from '../repositories';

@Injectable()
export class DeleteUserService {
  constructor(private userRepository: UserRepository) {}

  /**
   * Soft deletes a user by their unique identifier.
   *
   * This method delegates the deletion logic to the UserRepository, which performs a soft delete
   * rather than removing the user record from the database.
   *
   * @param userId - The unique identifier of the user to delete.
   * @returns A promise that resolves when the user has been softly deleted.
   * @throws UserNotFoundException if the user with the specified ID does not exist (from repository layer).
   */
  async deleteUserById(userId: string): Promise<void> {
    await this.userRepository.delete(userId);
  }
}
