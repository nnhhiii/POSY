import { Promotion } from '../types';
import { BaseRepository, Page } from '../../../common/interfaces';
import { PromotionQueryParams } from '../interfaces';

export abstract class PromotionRepository implements BaseRepository<Promotion> {
  /**
   * Finds a promotion by its unique code.
   * @param {string} code - The unique code of the promotion.
   * @returns {Promise<Promotion|null>} The promotion if found, otherwise null.
   */
  abstract findByCode(code: string): Promise<Promotion | null>;

  /**
   * Finds a promotion by its unique identifier.
   * @param {string} id - The unique ID of the promotion.
   * @returns {Promise<Promotion|null>} The promotion if found, otherwise null.
   */
  abstract findById(id: string): Promise<Promotion | null>;

  /**
   * Creates a new promotion.
   * @param {Promotion} promotion - The promotion data to create.
   * @returns {Promise<Promotion>} The created promotion.
   */
  abstract create(promotion: Promotion): Promise<Promotion>;

  /**
   * Updates an existing promotion by its ID.
   * @param {string} id - The unique ID of the promotion to update.
   * @param {Partial<Promotion>} promotion - The fields to update.
   * @returns {Promise<Promotion>} The updated promotion.
   */
  abstract update(
    id: string,
    promotion: Partial<Promotion>,
  ): Promise<Promotion>;

  /**
   * Deletes a promotion by its unique identifier.
   * @param {string} id - The unique ID of the promotion to delete.
   * @returns {Promise<void>} Resolves when the promotion is deleted.
   */
  abstract delete(id: string): Promise<void>;

  /**
   * Retrieves all promotions matching the given query parameters.
   * @param {PromotionQueryParams} params - The query parameters for filtering promotions.
   * @returns {Promise<Page<Promotion>>} A paginated list of promotions.
   */
  abstract getAllPaged(params: PromotionQueryParams): Promise<Page<Promotion>>;

  /**
   * Updates the status of all promotions that have expired before the given date.
   * @param {Date} date - The cutoff date; promotions with end dates before this will be updated.
   * @returns {Promise<number>} The number of promotions updated.
   */
  abstract updateExpiredPromotions(date: Date): Promise<number>;

}
