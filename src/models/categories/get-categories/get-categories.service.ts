import { Injectable } from '@nestjs/common';
import { CategoryRepository } from '../repositories';
import { Page } from '../../../common/interfaces';
import { Category } from '../types';
import { CategoryNotFoundException } from '../exceptions';

@Injectable()
export class GetCategoriesService {
  constructor(private readonly categoryRepository: CategoryRepository) {}

  /**
   * Retrieves a paginated list of categories.
   * @param {number} [page] - The page number to retrieve. If not provided, the default is used.
   * @param {number} [pageSize] - The number of categories per page. If not provided, the default is used.
   * @returns {Promise<Page<Category>>} A promise that resolves to a paginated list of categories.
   */
  async getCategories(
    page?: number,
    pageSize?: number,
  ): Promise<Page<Category>> {
    return this.categoryRepository.getCategories(page, pageSize);
  }

  /**
   * Retrieves a category by its unique identifier.
   * @param {string} id - The unique identifier of the category to retrieve.
   * @returns {Promise<Category>} A promise that resolves to the found category.
   * @throws {CategoryNotFoundException} If the category with the specified ID does not exist.
   */
  async getCategoryById(id: string): Promise<Category> {
    const category = await this.categoryRepository.findById(id);
    if (!category) {
      throw new CategoryNotFoundException(id);
    }
    return category;
  }
}
