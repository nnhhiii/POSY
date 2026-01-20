import { Injectable } from '@nestjs/common';
import {
  PromotionCategoryRepository,
  PromotionProductRepository,
  PromotionRepository,
} from '../repositories';
import { PromotionQueryParams } from '../interfaces';
import {
  PromotionCategoryNotFoundException,
  PromotionNotFoundException,
  PromotionProductNotFoundException,
} from '../exceptions';
import { Role } from '../../../common/enums';
import { Promotion, PromotionCategory, PromotionProduct } from '../types';
import { ProductRepository } from '../../products/repositories';
import { ProductNotFoundException } from '../../products/exceptions';
import { Page } from '../../../common/interfaces';

@Injectable()
export class GetPromotionsService {
  constructor(
    private readonly promotionRepository: PromotionRepository,
    private readonly promotionCategoryRepository: PromotionCategoryRepository,
    private readonly promotionProductRepository: PromotionProductRepository,
    private readonly productRepository: ProductRepository,
  ) {}

  /**
   * Retrieves a paginated list of promotions based on the provided query parameters.
   * @param {PromotionQueryParams} params - The query parameters for filtering and pagination.
   * @returns {Promise<Page<Promotion>>} A promise that resolves to a paginated list of promotions.
   */
  async getAll(params: PromotionQueryParams): Promise<Page<Promotion>> {
    return this.promotionRepository.getAllPaged(params);
  }

  /**
   * Retrieves a promotion by its unique identifier.
   * Throws PromotionNotFoundException if the promotion does not exist.
   * @param {string} id - The unique identifier of the promotion.
   * @returns {Promise<Promotion>} A promise that resolves to the promotion object.
   * @throws {PromotionNotFoundException} If the promotion is not found.
   */
  async getById(id: string): Promise<Promotion | null> {
    const promotion = await this.promotionRepository.findById(id);
    if (!promotion) throw new PromotionNotFoundException({ id });
    return promotion;
  }

  /**
   * Retrieves a promotion by its unique code.
   * Throws PromotionNotFoundException if the promotion does not exist.
   * @param {string} code - The unique code of the promotion.
   * @returns {Promise<Promotion>} A promise that resolves to the promotion object.
   * @throws {PromotionNotFoundException} If the promotion is not found.
   */
  async getByCode(code: string): Promise<Promotion | null> {
    const promotion = await this.promotionRepository.findByCode(code);
    if (!promotion) throw new PromotionNotFoundException({ code });
    return promotion;
  }

  /**
   * Retrieves all promotion categories.
   * @returns {Promise<any[]>} A promise that resolves to an array of promotion categories.
   */
  async getPromotionCategories(): Promise<any[]> {
    return await this.promotionCategoryRepository.getAll();
  }

  /**
   * Retrieves a promotion category by its unique identifier.
   * Throws PromotionCategoryNotFoundException if the category does not exist.
   * @param {string} id - The unique identifier of the promotion category.
   * @returns {Promise<PromotionCategory>} A promise that resolves to the promotion category object.
   * @throws {PromotionCategoryNotFoundException} If the category is not found.
   */
  async getPromotionCategoryById(
    id: string,
  ): Promise<PromotionCategory | null> {
    const result = await this.promotionCategoryRepository.findById(id);
    if (!result) throw new PromotionCategoryNotFoundException(id);
    return result;
  }

  /**
   * Retrieves all promotion products.
   * @returns {Promise<any[]>} A promise that resolves to an array of promotion products.
   */
  async getPromotionProducts(): Promise<any[]> {
    return await this.promotionProductRepository.getAll();
  }

  /**
   * Retrieves a promotion product by its unique identifier.
   * Throws PromotionProductNotFoundException if the product does not exist.
   * @param {string} id - The unique identifier of the promotion product.
   * @returns {Promise<PromotionProduct>} A promise that resolves to the promotion product object.
   * @throws {PromotionProductNotFoundException} If the product is not found.
   */
  async getPromotionProductById(id: string): Promise<PromotionProduct | null> {
    const result = await this.promotionProductRepository.findById(id);
    if (!result) throw new PromotionProductNotFoundException(id);
    return result;
  }

  /**
   * Retrieves all promotions associated with a given product ID.
   * For STAFF users, only returns ACTIVE and non-deleted promotions.
   * For ADMIN and MANAGER users, returns all promotions including deleted and disabled ones.
   *
   * @param {string} productId - The unique identifier of the product.
   * @param {string} role - The role of the requesting user (ADMIN, MANAGER, or STAFF).
   * @returns {Promise<Promotion[]>} A promise that resolves to an array of promotions.
   */
  async getPromotionsByProductId(
    productId: string,
    role: string,
  ): Promise<Promotion[]> {
    const includeAll = Role[role] === Role.ADMIN || Role[role] === Role.MANAGER;
    return await this.promotionProductRepository.getPromotionsByProductId(
      productId,
      includeAll,
    );
  }

  /**
   * Retrieves all promotions associated with a given category ID.
   * For STAFF users, only returns ACTIVE and non-deleted promotions.
   * For ADMIN and MANAGER users, returns all promotions including deleted and disabled ones.
   *
   * @param {string} categoryId - The unique identifier of the category.
   * @param {string} role - The role of the requesting user (ADMIN, MANAGER, or STAFF).
   * @returns {Promise<Promotion[]>} A promise that resolves to an array of promotions.
   */
  async getPromotionsByCategoryId(
    categoryId: string,
    role: string,
  ): Promise<Promotion[]> {
    const includeAll = Role[role] === Role.ADMIN || Role[role] === Role.MANAGER;
    return await this.promotionCategoryRepository.getPromotionsByCategoryId(
      categoryId,
      includeAll,
    );
  }

  /**
   * Retrieves all applicable promotions for a given product.
   *
   * This method returns all active, non-deleted promotions that can be applied to the specified product.
   * It combines:
   *   1. Promotions directly associated with the product (product-level promotions).
   *   2. Promotions associated with the product's category (category-level promotions), if the product has a category.
   *
   * The method does NOT deduplicate promotions by ID, as product and category promotions are managed separately.
   * Throws ProductNotFoundException if the product does not exist.
   *
   * @param {string} productId - The unique identifier of the product.
   * @returns {Promise<Promotion[]>} A promise that resolves to an array of applicable promotions for the product.
   * @throws {ProductNotFoundException} If the product is not found.
   */
  async getApplicablePromotionsForProduct(
    productId: string,
  ): Promise<Promotion[]> {
    const product = await this.productRepository.findById(productId);
    if (!product) throw new ProductNotFoundException(productId);

    const PAP = await this.promotionProductRepository.getPromotionsByProductId(
      productId,
      false,
    );

    if (product.categoryId) {
      const CAP =
        await this.promotionCategoryRepository.getPromotionsByCategoryId(
          product.categoryId,
          false,
        );
      return [...PAP, ...CAP];
    }
    return PAP;
  }
}
