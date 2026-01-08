import { Category } from '../types';
import { Page } from '../../../common/interfaces';

export abstract class CategoryRepository {
  /**
   * Creates a new category in the repository.
   * @param category - The category entity to create.
   * @returns A promise that resolves to the created category.
   */
  abstract createCategory(category: Category): Promise<Category>;

  /**
   * Updates an existing category by its unique identifier.
   * @param id - The unique identifier of the category to update.
   * @param updateData - Partial data to update the category with.
   * @returns A promise that resolves to the updated category.
   */
  abstract updateCategoryById(
    id: string,
    updateData: Partial<Category>,
  ): Promise<Category>;

  /**
   * Finds a category by its unique identifier.
   * @param id - The unique identifier of the category to find.
   * @returns A promise that resolves to the found category or null if not found.
   */
  abstract findById(id: string): Promise<Category | null>;

  /**
   * Deletes a category by its unique identifier.
   * @param id - The unique identifier of the category to delete.
   * @returns A promise that resolves when the category is deleted.
   */
  abstract deleteCategoryById(id: string): Promise<void>;

  /**
   * Retrieves a paginated list of categories.
   * @param page - The page number to retrieve (optional).
   * @param pageSize - The number of items per page (optional).
   * @returns A promise that resolves to a paginated list of categories.
   */
  abstract getCategories(
    page?: number,
    pageSize?: number,
  ): Promise<Page<Category>>;
}
