import { Injectable } from '@nestjs/common';
import { ProductRepository } from '../repositories';
import { Product } from '../types';

@Injectable()
export class UpdateProductService {
  constructor(private readonly productRepository: ProductRepository) {}

  /**
   * Updates an existing product in the repository.
   *
   * @param {string} id - The unique identifier of the product to update.
   * @param {Partial<Product>} product - An object containing the fields to update for the product. Only provided fields will be updated.
   * @returns {Promise<Product>} The updated product entity as stored in the repository.
   *
   * @throws {Error} If the update fails due to validation, the product not being found, or repository/database errors.
   */
  async update(id: string, product: Partial<Product>): Promise<Product> {
    return await this.productRepository.update(id, product);
  }
}
