import { CategoryRepository } from './category.repository-abstract';
import { Category, CategoryMapper } from '../types';
import { PrismaService } from '../../../providers/prisma/prisma.service';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/client';
import {
  DuplicateEntryException,
  ForeignKeyViolationException,
} from '../../../common/exceptions';
import { paginationConfig } from '../../../common/config';
import { Page } from '../../../common/interfaces';
import { camelCaseToSnakeCase } from '../../../common/utilities/string.util';
import { Injectable } from '@nestjs/common';
import { buildPage } from 'src/common/utilities/pagination.util';
import { CategoryNotFoundException } from '../exceptions';

@Injectable()
export class CategoryRepositoryImpl implements CategoryRepository {
  private readonly pageDefault = paginationConfig.default.page;
  private readonly pageSizeDefault = paginationConfig.default.pageSize;

  constructor(private readonly prismaService: PrismaService) {}

  /**
   * Creates a new category in the database.
   * @param category - The category entity to create.
   * @returns A promise that resolves to the created category.
   * @throws DuplicateEntryException if a category with a unique field already exists.
   */
  async createCategory(category: Category): Promise<Category> {
    const prismaCategory = CategoryMapper.toPrisma(category);
    try {
      return await this.prismaService.category
        .create({ data: prismaCategory })
        .then(CategoryMapper.toDomain);
    } catch (e) {
      if (e instanceof PrismaClientKnownRequestError) {
        if (e.code === 'P2002') {
          throw new DuplicateEntryException(
            'Category with provided unique field already exists',
          );
        }
      }
      throw e;
    }
  }

  /**
   * Deletes a category by its unique identifier.
   * @param id - The unique identifier of the category to delete.
   * @returns A promise that resolves when the category is deleted.
   * @throws CategoryNotFoundException if the category does not exist.
   * @throws ForeignKeyViolationException if the category is referenced by another record.
   */
  async deleteCategoryById(id: string): Promise<void> {
    try {
      await this.prismaService.category.delete({ where: { id } });
    } catch (e) {
      if (e instanceof PrismaClientKnownRequestError) {
        if (e.code === 'P2025') {
          throw new CategoryNotFoundException(id);
        } else if (e.code === 'P2003') {
          const fields = e.meta?.field_name as string[];
          throw new ForeignKeyViolationException(fields);
        }
      }
      throw e;
    }
  }

  /**
   * Finds a category by its unique identifier.
   * @param id - The unique identifier of the category to find.
   * @returns A promise that resolves to the found category or null if not found.
   */
  async findById(id: string): Promise<Category | null> {
    const prismaCategory = await this.prismaService.category.findUnique({
      where: { id },
    });

    return prismaCategory ? CategoryMapper.toDomain(prismaCategory) : null;
  }

  /**
   * Retrieves a paginated list of categories.
   * @param page - The page number to retrieve (default is the configured default).
   * @param pageSize - The number of items per page (default is the configured default).
   * @returns A promise that resolves to a paginated list of categories.
   */
  async getCategories(
    page = this.pageDefault,
    pageSize = this.pageSizeDefault,
  ): Promise<Page<Category>> {
    const [categories, total] = await this.prismaService.$transaction([
      this.prismaService.category.findMany({
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prismaService.category.count(),
    ]);

    return buildPage(
      categories.map(CategoryMapper.toDomain),
      page,
      pageSize,
      total,
    );
  }

  /**
   * Updates an existing category by its unique identifier.
   * @param id - The unique identifier of the category to update.
   * @param updateData - Partial data to update the category with.
   * @returns A promise that resolves to the updated category.
   * @throws CategoryNotFoundException if the category does not exist.
   * @throws DuplicateEntryException if a category with a unique field already exists.
   */
  async updateCategoryById(
    id: string,
    updateData: Partial<Category>,
  ): Promise<Category> {
    const category = await this.findById(id);
    if (!category) throw new CategoryNotFoundException(id);

    const dataSnakeCase = Object.entries(updateData).reduce(
      (acc, [key, value]) => {
        const snakeKey = camelCaseToSnakeCase(key);
        acc[snakeKey] = value;
        return acc;
      },
      {} as Record<string, any>,
    );

    if (dataSnakeCase.slug) {
      const existing = await this.prismaService.category.findUnique({
        where: { slug: dataSnakeCase.slug },
      });
      if (existing && existing.id !== id) {
        throw new DuplicateEntryException('Slug already exists.');
      }
    }
    try {
      return await this.prismaService.category
        .update({
          where: { id },
          data: dataSnakeCase,
        })
        ?.then(CategoryMapper.toDomain);
    } catch (e) {
      if (e instanceof PrismaClientKnownRequestError) {
        if (e.code === 'P2002') {
          throw new DuplicateEntryException(e.message);
        }
      }
      throw e;
    }
  }
}
