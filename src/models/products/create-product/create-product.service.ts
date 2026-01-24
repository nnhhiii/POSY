import { Injectable } from '@nestjs/common';
import { ProductRepository } from '../repositories';
import { Product } from '../types';

@Injectable()
export class CreateProductService {
  constructor(private readonly productRepository: ProductRepository) {}

  /**
   * Creates a new product in the repository.
   *
   * @param {Product} product - The product entity to be created. This should contain all required product fields.
   * @returns {Promise<Product>} The created product entity as stored in the repository.
   *
   * @throws {Error} If the product creation fails due to validation, database, or repository errors.
   */
  async create(product: Product): Promise<Product> {
    return await this.productRepository.create(product);
  }
}
