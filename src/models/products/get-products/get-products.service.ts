import { Injectable } from '@nestjs/common';
import { ProductRepository } from '../repositories';
import { ProductQueryParams } from '../interfaces';
import { Page } from '../../../common/interfaces';
import { Product } from '../types';
import { ProductNotFoundException } from '../exceptions';

@Injectable()
export class GetProductsService {
  constructor(private readonly productRepository: ProductRepository) {}

  /**
   * Retrieves a paginated list of products based on the provided query parameters.
   *
   * @param {ProductQueryParams} params - The query parameters for filtering, sorting, and paginating products.
   * @returns {Promise<Page<Product>>} A promise that resolves to a paginated list of products.
   *
   * @throws {Error} If the retrieval fails due to invalid parameters or repository/database errors.
   */
  async getAll(params: ProductQueryParams): Promise<Page<Product>> {
    return await this.productRepository.getAllPaged(params);
  }

  /**
   * Retrieves a product by its unique identifier.
   *
   * @param {string} id - The unique identifier of the product to retrieve.
   * @returns {Promise<Product>} A promise that resolves to the product object.
   *
   * @throws {ProductNotFoundException} If the product with the specified ID does not exist.
   * @throws {Error} If the retrieval fails due to repository/database errors.
   */
  async getById(id: string): Promise<Product> {
    const product = await this.productRepository.findById(id);
    if (!product) throw new ProductNotFoundException(id);
    return product;
  }
}
