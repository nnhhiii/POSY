import { ProductRepository } from './product.repository-abstract';
import { Injectable } from '@nestjs/common';
import { Product, ProductMapper } from '../types';
import { Page } from '../../../common/interfaces';
import { PrismaService } from '../../../providers/prisma/prisma.service';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/client';
import { DuplicateEntryException } from '../../../common/exceptions';
import { ProductKnownException } from '../exceptions';
import { paginationConfig } from '../../../common/config';
import {
  ProductOrderBy,
  ProductQueryFilter,
  ProductQueryParms,
} from '../interfaces';
import { Prisma } from '@prisma/client';
import { camelCaseToSnakeCase } from '../../../common/utilities/string.util';

const { page: defaultPage, pageSize: defaultPageSize } =
  paginationConfig.default;

@Injectable()
export class ProductRepositoryImpl implements ProductRepository {
  constructor(private readonly prismaService: PrismaService) {}

  /**
   * Creates a new product in the database.
   *
   * Converts the domain product entity to a Prisma-compatible object and attempts to create it in the database.
   * Throws a DuplicateEntryException if a product with the same unique data already exists.
   *
   * @param {Product} entity - The product domain entity to create.
   * @returns {Promise<Product>} A promise that resolves to the created product domain object.
   * @throws {DuplicateEntryException} If a product with the provided data already exists.
   * @throws {Error} For other database or mapping errors.
   */
  async create(entity: Product): Promise<Product> {
    try {
      const prisma = ProductMapper.toPrisma(entity);
      return await this.prismaService.product
        .create({
          data: prisma,
        })
        .then(ProductMapper.toDomain);
    } catch (e) {
      if (e instanceof PrismaClientKnownRequestError) {
        if (e.code === 'P2002') {
          throw new DuplicateEntryException(
            'Product with provided data already exists',
          );
        }
      }
      throw e;
    }
  }

  /**
   * Soft deletes a product by its ID.
   *
   * Marks the product as deleted by setting 'is_deleted' to true and 'deleted_at' to the current date.
   * Throws a ProductKnownException if the product is not found.
   *
   * @param {string} id - The unique identifier of the product to delete.
   * @returns {Promise<void>} A promise that resolves when the product is soft deleted.
   * @throws {ProductKnownException} If the product is not found.
   */
  async delete(id: string): Promise<void> {
    const product = await this.findById(id);
    if (!product) {
      throw new ProductKnownException(
        'NOT_FOUND',
        `Product with id ${id} not found`,
        { id },
      );
    }
    await this.prismaService.product.update({
      where: { id },
      data: {
        is_deleted: true,
        deleted_at: new Date(),
      },
    });
  }

  /**
   * Finds a product by its unique identifier.
   *
   * @param {string} id - The unique identifier of the product to find.
   * @returns {Promise<Product | null>} A promise that resolves to the product domain object if found, or null otherwise.
   */
  async findById(id: string): Promise<Product | null> {
    return await this.prismaService.product
      .findUnique({
        where: { id },
      })
      ?.then(ProductMapper.toDomain);
  }

  /**
   * Retrieves a paginated list of products based on query parameters.
   *
   * @param {ProductQueryParms} params - The query parameters for pagination, filtering, and sorting.
   *   - page: The page number to retrieve (default is from config).
   *   - pageSize: The number of items per page (default is from config).
   *   - filter: Filtering options for products (see ProductQueryFilter).
   *   - orderBy: Array of sorting options for specific fields and direction.
   * @returns {Promise<Page<Product>>} A promise that resolves to a paginated result containing products and pagination info.
   */
  async getAllPaged(params: ProductQueryParms): Promise<Page<Product>> {
    // TODO: Implement search engine
    const {
      page = defaultPage,
      pageSize = defaultPageSize,
      filter,
      orderBy: pairs,
    } = params;
    const where = this.buildWhereClause(filter);
    const orderBy = this.buildOrderByClause(pairs);
    const [items, total] = await Promise.all([
      this.prismaService.product.findMany({
        where,
        orderBy,
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prismaService.product.count(),
    ]);
    return {
      items: items.map((p) => ProductMapper.toDomain(p)),
      page,
      pageSize,
      total,
      totalPages: Math.floor(total / pageSize),
    };
  }

  /**
   * Updates a product by its ID with the provided partial entity data.
   *
   * Converts camelCase keys to snake_case for database compatibility. Ignores the 'id' field in the update data.
   *
   * @param {string} id - The unique identifier of the product to update.
   * @param {Partial<Product>} entity - The partial product data to update.
   * @returns {Promise<Product>} A promise that resolves to the updated product domain object.
   */
  async update(id: string, entity: Partial<Product>): Promise<Product> {
    const dataWithoutId = { ...entity };
    delete dataWithoutId.id;

    const snakeKeyData = Object.entries(dataWithoutId).reduce(
      (acc, [key, value]) => {
        const snakeKey = camelCaseToSnakeCase(key);
        acc[snakeKey] = value;
        return acc;
      },
      {} as Record<string, any>,
    );

    return await this.prismaService.product
      .update({
        where: { id },
        data: snakeKeyData,
      })
      .then(ProductMapper.toDomain);
  }

  /**
   * Builds the Prisma orderBy clause from the provided order by pairs.
   *
   * @param {ProductOrderBy} [pairs] - The order by pairs specifying fields and directions.
   * @returns {Prisma.ProductOrderByWithRelationInput} The Prisma orderBy clause for sorting.
   */
  private buildOrderByClause(
    pairs?: ProductOrderBy,
  ): Prisma.ProductOrderByWithRelationInput {
    if (!pairs) {
      return { created_at: 'desc' };
    }

    const orderBy: Prisma.ProductOrderByWithRelationInput = {};

    for (const [key, value] of Object.entries(pairs)) {
      orderBy[key] = value;
    }

    return orderBy;
  }

  /**
   * Builds the Prisma where clause from the provided product query filters.
   *
   * @param {ProductQueryFilter} [filters] - The filters to apply to the product query.
   * @returns {Prisma.ProductWhereInput} The Prisma where clause for filtering products.
   */
  private buildWhereClause(
    filters?: ProductQueryFilter,
  ): Prisma.ProductWhereInput {
    if (!filters) return {};

    const where: Prisma.ProductWhereInput = {};

    if (filters.priceMin || filters.priceMax) {
      where.price = {};
      if (filters.priceMin) {
        where.price = { gte: filters.priceMin };
      }
      if (filters.priceMax) {
        where.price = { lte: filters.priceMax };
      }
    }
    if (filters.categoryId) {
      where.category_id = { in: filters.categoryId };
    }
    if (filters.discountType) {
      where.discount_type = filters.discountType;
    }
    if (filters.discountValueMin || filters.discountValueMax) {
      where.discount_value = {};
      if (filters.discountValueMin) {
        where.discount_value = { gte: filters.discountValueMin };
      }
      if (filters.discountValueMax) {
        where.discount_value = { lte: filters.discountValueMax };
      }
    }
    if (filters.stockQuantityMin || filters.stockQuantityMax) {
      where.discount_value = {};
      if (filters.stockQuantityMin) {
        where.discount_value = { gte: filters.stockQuantityMin };
      }
      if (filters.stockQuantityMax) {
        where.discount_value = { lte: filters.stockQuantityMax };
      }
    }
    if (filters.isAvailable) {
      where.is_available = filters.isAvailable;
    }
    if (filters.isDeleted) {
      where.is_deleted = filters.isDeleted;
    }

    return where;
  }
}
