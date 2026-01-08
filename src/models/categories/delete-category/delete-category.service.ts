import { Injectable } from '@nestjs/common';
import { CategoryRepository } from '../repositories';

@Injectable()
export class DeleteCategoryService {
  constructor(private readonly categoryRepository: CategoryRepository) {}

  /**
   * Deletes a category by its unique identifier.
   *
   * This method delegates the deletion logic to the CategoryRepository, which handles
   * the actual removal of the category entity from the data store.
   *
   * @param id - The unique identifier of the category to delete.
   * @returns A promise that resolves when the category is successfully deleted.
   * @throws CategoryNotFoundException if the category does not exist (from repository layer).
   * @throws ForeignKeyViolationException if the category is referenced by another record (from repository layer).
   */
  async deleteCategoryById(id: string) {
    await this.categoryRepository.deleteCategoryById(id);
  }
}
