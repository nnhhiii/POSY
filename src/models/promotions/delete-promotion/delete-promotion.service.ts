import { Injectable } from '@nestjs/common';
import {
  PromotionCategoryRepository,
  PromotionProductRepository,
  PromotionRepository,
} from '../repositories';

@Injectable()
export class DeletePromotionService {
  constructor(
    private readonly promotionRepository: PromotionRepository,
    private readonly promotionCategoryRepository: PromotionCategoryRepository,
    private readonly promotionProductRepository: PromotionProductRepository,
  ) {}

  /**
   * Deletes a promotion by its ID.
   *
   * Finds the promotion by the given ID. If the promotion does not exist or is already deleted,
   * the method returns without performing any action. Otherwise, it deletes the promotion.
   *
   * @param {string} id - The unique identifier of the promotion to delete.
   * @returns {Promise<void>} Resolves when the operation is complete.
   */
  async delete(id: string): Promise<void> {
    const promotion = await this.promotionRepository.findById(id);
    if (!promotion || (promotion && promotion.isDeleted)) return;
    await this.promotionRepository.delete(id);
  }

  /**
   * Deletes a promotion category by its ID.
   *
   * Directly deletes the promotion category with the specified ID.
   *
   * @param {string} id - The unique identifier of the promotion category to delete.
   * @returns {Promise<void>} Resolves when the operation is complete.
   */
  async deletePromotionCategory(id: string): Promise<void> {
    await this.promotionCategoryRepository.delete(id);
  }

  /**
   * Deletes a promotion product by its ID.
   *
   * This method removes the promotion product associated with the provided unique identifier.
   * If the product does not exist, the repository is expected to handle the case gracefully.
   *
   * @param {string} id - The unique identifier of the promotion product to delete.
   * @returns {Promise<void>} Resolves when the deletion operation is complete.
   */
  async deletePromotionProduct(id: string): Promise<void> {
    await this.promotionProductRepository.delete(id);
  }
}
