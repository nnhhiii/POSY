import { ProductRepository } from './product.repository-abstract';
import { Injectable } from '@nestjs/common';
import { Product, ProductMapper } from '../types';
import { Page } from '../../../common/interfaces';
import { PrismaService } from '../../../providers/prisma/prisma.service';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/client';
import {
  DuplicateEntryException,
  ForeignKeyViolationException,
} from '../../../common/exceptions';
import { ProductNotFoundException } from '../exceptions';
import { paginationConfig } from '../../../common/config';
import {
  ProductOrderBy,
  ProductQueryFilter,
  ProductQueryParams,
} from '../interfaces';
import { Prisma } from '@prisma/client';
import { camelCaseToSnakeCase } from '../../../common/utilities/string.util';
import { MeilisearchProductService } from '../../../providers/meilisearch/meilisearch-product.service';

const { page: defaultPage, pageSize: defaultPageSize } =
  paginationConfig.default;

@Injectable()
export class ProductRepositoryImpl implements ProductRepository {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly meilisearchProductService: MeilisearchProductService,
  ) {}

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
      const product = await this.prismaService.product
        .create({ data: prisma, include: { category: true } })
        .then(ProductMapper.toDomain);

      // Index the product in MeiliSearch asynchronously
      void this.meilisearchProductService.indexProduct(product);

      return product;
    } catch (e) {
      if (e instanceof PrismaClientKnownRequestError) {
        if (e.code === 'P2002') {
          throw new DuplicateEntryException(
            'Product with provided data already exists',
          );
        } else if (e.code === 'P2003') {
          throw new ForeignKeyViolationException(entity);
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
   * @returns {Promise<void>} A promise that resolves when the product is softly deleted.
   * @throws {ProductNotFoundException} If the product with the specified ID does not exist.
   */
  async delete(id: string): Promise<void> {
    const product = await this.findById(id);
    if (!product) {
      throw new ProductNotFoundException(id);
    }
    await this.prismaService.product.update({
      where: { id },
      data: {
        is_deleted: true,
        deleted_at: new Date(),
      },
    });

    // Remove from MeiliSearch index asynchronously
    void this.meilisearchProductService.deleteDocument(id);
  }

  /**
   * Finds a product by its unique identifier.
   *
   * @param {string} id - The unique identifier of the product to find.
   * @returns {Promise<Product | null>} A promise that resolves to the product domain object if found, or null otherwise.
   */
  async findById(id: string): Promise<Product | null> {
    const product = await this.prismaService.product.findUnique({
      where: { id },
      include: { category: true },
    });
    if (!product) return null;
    return ProductMapper.toDomain(product);
  }

  /**
   * Retrieves a paginated list of products based on query parameters.
   *
   * @param {ProductQueryParams} params - The query parameters for pagination, filtering, and sorting.
   *   - page: The page number to retrieve (default is from config).
   *   - pageSize: The number of items per page (default is from config).
   *   - filter: Filtering options for products (see ProductQueryFilter).
   *   - orderBy: Array of sorting options for specific fields and direction.
   * @returns {Promise<Page<Product>>} A promise that resolves to a paginated result containing products and pagination info.
   */
  async getAllPaged(params: ProductQueryParams): Promise<Page<Product>> {
    const { filter } = params;

    // Use MeiliSearch if there's a search query
    if (filter?.query) {
      return this.searchWithMeiliSearch(params);
    }

    // Otherwise use Prisma for regular database queries
    return this.searchWithPrisma(params);
  }

  /**
   * Search products using MeiliSearch for full-text search.
   */
  private async searchWithMeiliSearch(
    params: ProductQueryParams,
  ): Promise<Page<Product>> {
    const {
      page = defaultPage,
      pageSize = defaultPageSize,
      filter,
      orderBy: pairs,
    } = params;
    const filterString =
      this.meilisearchProductService.buildFilterString(filter);

    // Convert orderBy pairs to MeiliSearch sort format: ["field:direction", ...]
    let sort: string[] | undefined;
    if (pairs && pairs.length > 0) {
      sort = pairs.map((pair) => `${pair.field}:${pair.direction}`);
    }

    // Search using MeiliSearch
    const searchResult = await this.meilisearchProductService.searchDocuments(
      filter!.query as string,
      page - 1, // MeiliSearch uses 0-based pagination
      pageSize,
      sort,
      { filters: filterString },
    );

    // Fetch full product details from database for the found IDs
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const productIds = searchResult.items.map((item: any) => item.id as string);

    if (productIds.length === 0) {
      return {
        items: [],
        page,
        pageSize,
        total: 0,
        totalPages: 0,
      };
    }

    const products = await this.prismaService.product.findMany({
      where: { id: { in: productIds } },
      include: { category: true },
    });

    // Maintain the order from MeiliSearch results
    const productMap = new Map(products.map((p) => [p.id, p]));
    const orderedProducts = productIds
      .map((id) => productMap.get(id))
      .filter((p): p is NonNullable<typeof p> => p !== undefined);

    return {
      items: orderedProducts.map(ProductMapper.toDomain),
      page,
      pageSize,
      total: searchResult.total,
      totalPages: searchResult.totalPages,
    };
  }

  /**
   * Search products using Prisma for database queries.
   */
  private async searchWithPrisma(
    params: ProductQueryParams,
  ): Promise<Page<Product>> {
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
        include: { category: true },
      }),
      this.prismaService.product.count({ where }),
    ]);

    return {
      items: items.map((p) => ProductMapper.toDomain(p)),
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
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

    const product = await this.prismaService.product
      .update({
        where: { id },
        data: snakeKeyData,
        include: { category: true },
      })
      .then(ProductMapper.toDomain);

    // Re-index the product in MeiliSearch asynchronously
    void this.meilisearchProductService.indexProduct(product);

    return product;
  }

  /**
   * Builds the Prisma orderBy clause from the provided order by pairs.
   *
   * @param {ProductOrderBy} [pairs] - The order by pairs specifying fields and directions.
   * @returns {Prisma.ProductOrderByWithRelationInput | Prisma.ProductOrderByWithRelationInput[]} The Prisma orderBy clause for sorting.
   */
  private buildOrderByClause(
    pairs?: ProductOrderBy,
  ):
    | Prisma.ProductOrderByWithRelationInput
    | Prisma.ProductOrderByWithRelationInput[] {
    if (!pairs || pairs.length === 0) {
      return { created_at: 'desc' };
    }

    const mapping: Record<string, string> = {
      price: 'price',
      stockQuantity: 'stock_quantity',
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    };
    return pairs.map((pair) => {
      const snakeField = mapping[pair.field] || pair.field;
      return { [snakeField]: pair.direction };
    });
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
