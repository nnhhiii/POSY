import { Product } from '../../../models/products/types';
import { MeiliSearchProduct } from '../types';

/**
 * Mapper to convert Product domain entity to MeiliSearchProduct document.
 */
export class MeilisearchProductMapper {
  /**
   * Converts a Product domain entity to a MeiliSearchProduct document for indexing.
   *
   * @param product - The product domain entity to convert
   * @returns MeiliSearchProduct document ready for indexing
   */
  static toMeili(product: Product): MeiliSearchProduct {
    if (!product.id) {
      throw new Error('Product ID is required for MeiliSearch indexing');
    }

    if (!product.category) {
      throw new Error('Product category is required for MeiliSearch indexing');
    }

    if (!product.category.id) {
      throw new Error(
        'Product category ID is required for MeiliSearch indexing',
      );
    }

    return {
      id: product.id,
      name: product.name,
      price: product.price,
      discountType: product.discountType,
      discountValue: product.discountValue,
      imageUrl: product.imageUrl,
      isDeleted: product.isDeleted,
      isAvailable: product.isAvailable,
      stockQuantity: product.stockQuantity,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
      category: {
        id: product.category.id,
        name: product.category.name,
      },
    };
  }

  /**
   * Converts an array of Product domain entities to MeiliSearchProduct documents.
   *
   * @param products - Array of product domain entities
   * @returns Array of MeiliSearchProduct documents
   */
  static toMeiliArray(products: Product[]): MeiliSearchProduct[] {
    return products.map((product) => this.toMeili(product));
  }
}
