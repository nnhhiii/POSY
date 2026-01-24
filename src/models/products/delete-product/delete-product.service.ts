import { Injectable } from '@nestjs/common';
import { ProductRepository } from '../repositories';

@Injectable()
export class DeleteProductService {
  constructor(private readonly productRepository: ProductRepository) {}

  /**
   * Deletes a product from the repository by its unique identifier.
   *
   * @param {string} id - The unique identifier of the product to delete.
   * @returns {Promise<void>} Resolves when the product has been successfully deleted.
   *
   * @throws {Error} If the deletion fails due to the product not being found or repository/database errors.
   */
  async delete(id: string): Promise<void> {
    await this.productRepository.delete(id);
  }
}
