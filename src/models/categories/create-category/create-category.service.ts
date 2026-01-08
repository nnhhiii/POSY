import { Injectable } from '@nestjs/common';
import { CategoryRepository } from '../repositories';
import { Category } from '../types';

@Injectable()
export class CreateCategoryService {
  constructor(private readonly categoryRepository: CategoryRepository) {}

  /**
   * Creates a new category using the provided category data.
   *
   * This method delegates the creation logic to the CategoryRepository, which handles
   * the actual persistence of the category entity. It returns the created category object.
   *
   * @param category - The category entity to be created. Should contain all required fields for creation.
   * @returns A promise that resolves to the created Category object.
   * @throws DuplicateEntryException if a category with a unique field already exists (from repository layer).
   * @throws RelatedRecordNotFoundException if a related record is not found (from repository layer).
   */
  async createCategory(category: Category): Promise<Category> {
    return await this.categoryRepository.createCategory(category);
  }
}
