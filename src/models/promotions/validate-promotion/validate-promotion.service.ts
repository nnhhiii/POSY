import { Injectable } from '@nestjs/common';
import {
  PromotionCategoryRepository,
  PromotionProductRepository,
  PromotionRepository,
} from '../repositories';
import { PromotionApplicability, PromotionStatus } from '../enums';
import { ValidatePromotionDto, ValidatePromotionResultDto } from './dto';

@Injectable()
export class ValidatePromotionService {
  constructor(
    private readonly promotionRepository: PromotionRepository,
    private readonly promotionCategoryRepository: PromotionCategoryRepository,
    private readonly promotionProductRepository: PromotionProductRepository,
  ) {}

  /**
   * Validates a promotion for a specific product (not entire order).
   * This validates if a promotion can be applied to a single product at purchase time.
   *
   * Validation steps:
   * 1. Check if promotion exists and is not deleted
   * 2. Check if promotion status is ACTIVE
   * 3. Check if current time is within promotion period (start_at <= now <= end_at)
   * 4. Check if product price * quantity meets minimum order value
   * 5. Check if usage limit has been reached
   * 6. Check applicability-specific conditions based on the specific product
   *
   * @param dto - The validation request containing promotion ID, product details, and quantity
   * @returns Promise<ValidatePromotionResultDto> - Validation result with isValid flag and optional reason
   */
  async validate(
    dto: ValidatePromotionDto,
  ): Promise<ValidatePromotionResultDto> {
    const promotion = await this.promotionRepository.findById(dto.promotionId);

    // Check if promotion exists or is deleted
    if (!promotion || promotion.isDeleted) {
      return {
        isValid: false,
        reason: 'Promotion not found',
      };
    }

    // Check if promotion status is ACTIVE
    if (promotion.status !== PromotionStatus.ACTIVE) {
      return {
        isValid: false,
        reason: `Promotion status is ${promotion.status}, not available for use`,
        metadata: { status: promotion.status },
      };
    }

    const now = new Date();

    // Check if promotion has started
    if (promotion.startAt > now) {
      return {
        isValid: false,
        reason: 'Promotion has not started yet',
        metadata: {
          startAt: promotion.startAt,
          now,
        },
      };
    }

    // Check if promotion has expired
    if (promotion.endAt < now) {
      return {
        isValid: false,
        reason: 'Promotion has expired',
        metadata: {
          endAt: promotion.endAt,
          now,
        },
      };
    }

    // Calculate product total (price * quantity)
    const productTotal = dto.productPrice * dto.quantity;
    const minOrderValue = Number(promotion.minOrderValue);
    // Check minimum order value against product total
    if (minOrderValue && productTotal < minOrderValue) {
      return {
        isValid: false,
        reason: 'Product total does not meet minimum order value',
        metadata: {
          productTotal,
          minOrderValue,
          productPrice: dto.productPrice,
          quantity: dto.quantity,
        },
      };
    }

    // Check usage limit
    if (
      promotion.usageLimit !== null &&
      promotion.usageCount >= promotion.usageLimit
    ) {
      return {
        isValid: false,
        reason: 'Promotion usage limit has been reached',
        metadata: {
          usageCount: promotion.usageCount,
          usageLimit: promotion.usageLimit,
        },
      };
    }

    // Check applicability-specific conditions for the specific product
    switch (promotion.applicability) {
      case PromotionApplicability.ALL_ITEMS:
        // ALL_ITEMS: Promotion applies to any product
        return { isValid: true };

      case PromotionApplicability.SPECIFIC_CATEGORIES:
        if (!promotion.id) {
          return {
            isValid: false,
            reason: 'Promotion ID is missing',
          };
        }
        return await this.validateSpecificCategories(dto, promotion.id);

      case PromotionApplicability.SPECIFIC_ITEMS:
        if (!promotion.id) {
          return {
            isValid: false,
            reason: 'Promotion ID is missing',
          };
        }
        return await this.validateSpecificItems(dto, promotion.id);

      case PromotionApplicability.QUANTITY_BASED:
        return this.validateQuantityBased(dto, promotion.minQuantity);

      default:
        return {
          isValid: false,
          reason: 'Unknown promotion applicability',
          metadata: { applicability: promotion.applicability },
        };
    }
  }

  /**
   * Validates SPECIFIC_CATEGORIES promotion type.
   * Checks if the product's category is associated with the promotion.
   */
  private async validateSpecificCategories(
    dto: ValidatePromotionDto,
    promotionId: string,
  ): Promise<ValidatePromotionResultDto> {
    if (!dto.categoryId) {
      return {
        isValid: false,
        reason:
          'Product category is required for SPECIFIC_CATEGORIES promotion',
      };
    }

    // Check if the product's category is associated with this promotion
    const exists = await this.prismaCheckPromotionCategory(
      promotionId,
      dto.categoryId,
    );

    if (exists) {
      return { isValid: true };
    }

    return {
      isValid: false,
      reason: 'Product category is not associated with this promotion',
      metadata: {
        productCategoryId: dto.categoryId,
      },
    };
  }

  /**
   * Validates SPECIFIC_ITEMS promotion type.
   * Checks if the specific product is associated with the promotion.
   */
  private async validateSpecificItems(
    dto: ValidatePromotionDto,
    promotionId: string,
  ): Promise<ValidatePromotionResultDto> {
    // Check if the specific product is associated with this promotion
    const exists = await this.prismaCheckPromotionProduct(
      promotionId,
      dto.productId,
    );

    if (exists) {
      return { isValid: true };
    }

    return {
      isValid: false,
      reason: 'This product is not associated with this promotion',
      metadata: {
        productId: dto.productId,
      },
    };
  }

  /**
   * Validates QUANTITY_BASED promotion type.
   * Checks if the provided quantity meets the minimum quantity requirement.
   */
  private validateQuantityBased(
    dto: ValidatePromotionDto,
    minQuantity: number | null,
  ): ValidatePromotionResultDto {
    if (dto.quantity === undefined) {
      return {
        isValid: false,
        reason: 'No quantity provided for QUANTITY_BASED promotion',
      };
    }

    if (minQuantity === null) {
      return {
        isValid: false,
        reason: 'Promotion does not have a minimum quantity set',
      };
    }

    if (dto.quantity < minQuantity) {
      return {
        isValid: false,
        reason: 'Quantity does not meet minimum quantity requirement',
        metadata: {
          quantity: dto.quantity,
          minQuantity,
        },
      };
    }

    return { isValid: true };
  }

  /**
   * Helper method to check if a promotion-category association exists.
   * Uses direct Prisma query for efficiency.
   */
  private async prismaCheckPromotionCategory(
    promotionId: string,
    categoryId: string,
  ): Promise<boolean> {
    // This is a workaround - ideally we'd inject PrismaService
    // For now, we'll use the repository method indirectly
    try {
      const promotions =
        await this.promotionCategoryRepository.getPromotionsByCategoryId(
          categoryId,
          true,
        );
      return promotions.some((p) => p.id === promotionId);
    } catch {
      return false;
    }
  }

  /**
   * Helper method to check if a promotion-product association exists.
   * Uses direct Prisma query for efficiency.
   */
  private async prismaCheckPromotionProduct(
    promotionId: string,
    productId: string,
  ): Promise<boolean> {
    // This is a workaround - ideally we'd inject PrismaService
    // For now, we'll use the repository method indirectly
    try {
      const promotions =
        await this.promotionProductRepository.getPromotionsByProductId(
          productId,
          true,
        );
      return promotions.some((p) => p.id === promotionId);
    } catch {
      return false;
    }
  }
}
