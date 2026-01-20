import { Injectable } from '@nestjs/common';
import { Promotion, PromotionCategory, PromotionProduct } from '../types';
import {
  PromotionCategoryRepository,
  PromotionProductRepository,
  PromotionRepository,
} from '../repositories';
import { PromotionApplicability, PromotionStatus } from '../enums';
import { CategoryNotFoundException } from '../../categories/exceptions';
import { CategoryRepository } from '../../categories/repositories';
import { PromotionNotFoundException } from '../exceptions';
import { ProductRepository } from '../../products/repositories';
import { ProductNotFoundException } from '../../products/exceptions';
import { PromotionUnusableException } from '../exceptions/PromotionUnusableException';

@Injectable()
export class CreatePromotionService {
  constructor(
    private readonly promotionRepository: PromotionRepository,
    private readonly promotionCategoryRepository: PromotionCategoryRepository,
    private readonly categoryRepository: CategoryRepository,
    private readonly promotionProductRepository: PromotionProductRepository,
    private readonly productRepository: ProductRepository,
  ) {}

  /**
   * Creates a new promotion. If the promotion is not quantity-based, clears the minQuantity field.
   * @param promotion - The promotion domain object to create.
   * @returns The created promotion domain object.
   */
  async create(promotion: Promotion) {
    // If the promotion is not quantity-based, clear the minQuantity field
    if (promotion.applicability !== PromotionApplicability.QUANTITY_BASED) {
      promotion.minQuantity = null;
    }
    return await this.promotionRepository.create(promotion);
  }

  /**
   * Creates a new promotion-category association after validating the category and promotion.
   * Throws an exception if the category or promotion does not exist, is deleted, is not active,
   * or if the promotion's applicability does not allow adding categories.
   *
   * @param {PromotionCategory} promotionCategory - The promotion-category association to create.
   * @returns {Promise<PromotionCategory>} The created promotion-category association.
   * @throws {CategoryNotFoundException} If the category does not exist.
   * @throws {PromotionNotFoundException} If the promotion does not exist or is deleted.
   * @throws {PromotionUnusableException} If the promotion is not active or applicability is invalid.
   */
  async createPromotionCategory(
    promotionCategory: PromotionCategory,
  ): Promise<PromotionCategory> {
    const category = await this.categoryRepository.findById(
      promotionCategory.categoryId,
    );

    // Validate that the category exists
    if (!category) {
      throw new CategoryNotFoundException(promotionCategory.categoryId);
    }

    const promotion = await this.promotionRepository.findById(
      promotionCategory.promotionId,
    );

    // Validate that the promotion exists
    if (!promotion || promotion.isDeleted) {
      throw new PromotionNotFoundException({
        id: promotionCategory.promotionId,
      });
    }
    // Validate that the promotion is ACTIVE
    if (promotion.status !== PromotionStatus.ACTIVE) {
      throw new PromotionUnusableException(
        promotionCategory.promotionId,
        'Promotion is not active.',
      );
    }
    // Validate that the promotion applicability is SPECIFIC_CATEGORIES
    if (
      promotion.applicability !== PromotionApplicability.SPECIFIC_CATEGORIES
    ) {
      throw new PromotionUnusableException(
        promotionCategory.promotionId,
        'Promotion applicability does not allow adding categories.',
        { applicability: promotion.applicability },
      );
    }

    return await this.promotionCategoryRepository.create(promotionCategory);
  }

  /**
   * Creates a new promotion-product association after validating the product and promotion.
   * Throws an exception if the product or promotion does not exist, is deleted, is not active,
   * or if the promotion's applicability does not allow adding products.
   *
   * @param {PromotionProduct} promotionProduct - The promotion-product association to create.
   * @returns {Promise<PromotionProduct>} The created promotion-product association.
   * @throws {ProductNotFoundException} If the product does not exist.
   * @throws {PromotionNotFoundException} If the promotion does not exist or is deleted.
   * @throws {PromotionUnusableException} If the promotion is not active or applicability is invalid.
   */
  async createPromotionProduct(
    promotionProduct: PromotionProduct,
  ): Promise<PromotionProduct> {
    const product = await this.productRepository.findById(
      promotionProduct.productId,
    );

    // Validate that the product exists
    if (!product) {
      throw new ProductNotFoundException(promotionProduct.productId);
    }

    const promotion = await this.promotionRepository.findById(
      promotionProduct.promotionId,
    );

    // Validate that the promotion exists
    if (!promotion || promotion.isDeleted) {
      throw new PromotionNotFoundException({
        id: promotionProduct.promotionId,
      });
    }
    // Validate that the promotion is ACTIVE
    if (promotion.status !== PromotionStatus.ACTIVE) {
      throw new PromotionUnusableException(
        promotionProduct.promotionId,
        'Promotion is not active.',
      );
    }
    // Validate that the promotion applicability is SPECIFIC_ITEMS
    if (promotion.applicability !== PromotionApplicability.SPECIFIC_ITEMS) {
      throw new PromotionUnusableException(
        promotionProduct.promotionId,
        'Promotion applicability does not allow adding products.',
        { applicability: promotion.applicability },
      );
    }

    return await this.promotionProductRepository.create(promotionProduct);
  }
}
