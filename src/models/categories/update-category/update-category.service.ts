import { Injectable } from '@nestjs/common';
import { CategoryRepository } from '../repositories';
import { Category } from '../types';
import { CategoryNotFoundException } from '../exceptions';

@Injectable()
export class UpdateCategoryService {
  constructor(private readonly categoryRepository: CategoryRepository) {}

  /**
   * Updates an existing category by its unique identifier.
   *
   * This method delegates the update logic to the CategoryRepository, which handles
   * the actual persistence of the updated category entity. It returns the updated category object.
   *
   * @param id - The unique identifier of the category to update.
   * @param updateDate - Partial data to update the category with. Only provided fields will be updated.
   * @returns A promise that resolves to the updated Category object.
   * @throws CategoryNotFoundException if the category does not exist (from repository layer).
   */
  async updateCategoryById(id: string, updateDate: Partial<Category>) {
    return await this.categoryRepository.updateCategoryById(id, updateDate);
  }

  /**
   * Toggles the active status of a category by its unique identifier.
   *
   * This method retrieves the category by its ID, inverts its `isActive` property,
   * and updates the category in the repository. If the category does not exist,
   * it throws a CategoryNotFoundException.
   *
   * @param id - The unique identifier of the category whose active status will be toggled.
   * @returns A promise that resolves when the category's active status has been updated.
   * @throws CategoryNotFoundException if the category does not exist.
   */
  async toggleCategoryActive(id: string) {
    const category = await this.categoryRepository.findById(id);
    if (!category) throw new CategoryNotFoundException(id);

    category.isActive = !category.isActive;
    await this.categoryRepository.updateCategoryById(id, {
      isActive: category.isActive,
    });
  }
}
