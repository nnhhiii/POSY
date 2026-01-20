import { PromotionCategoryRepository } from './promotion-category.repository-abstract';
import {
  Promotion,
  PromotionCategory,
  PromotionCategoryMapper,
} from '../types';
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../providers/prisma/prisma.service';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/client';
import { DuplicateEntryException } from '../../../common/exceptions';
import { PromotionCategoryNotFoundException } from '../exceptions';
import { PromotionStatus } from '@prisma/client';
import { CategoryRepository } from '../../categories/repositories';
import { CategoryNotFoundException } from '../../categories/exceptions';

@Injectable()
export class PromotionCategoryRepositoryImpl implements PromotionCategoryRepository {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly categoryRepository: CategoryRepository,
  ) {}

  /**
   * Creates a new PromotionCategory entity in the database.
   * @param entity - The PromotionCategory domain object to create.
   * @returns The created PromotionCategory domain object.
   * @throws {DuplicateEntryException} If a PromotionCategory with the same unique field already exists.
   * @throws {PrismaClientKnownRequestError} For other Prisma errors.
   */
  async create(entity: PromotionCategory): Promise<PromotionCategory> {
    try {
      const prismaData = PromotionCategoryMapper.toPrisma(entity);
      return await this.prismaService.promotionCategory
        .create({
          data: prismaData,
        })
        .then(PromotionCategoryMapper.toDomain);
    } catch (e) {
      if (e instanceof PrismaClientKnownRequestError) {
        if (e.code === 'P2002') {
          throw new DuplicateEntryException(
            'PromotionCategory with given unique field already exists.',
          );
        }
      }
      throw e;
    }
  }

  /**
   * Deletes a PromotionCategory entity by its unique identifier.
   * @param id - The unique identifier of the PromotionCategory to delete.
   * @returns Resolves when the entity is deleted.
   * @throws {PromotionCategoryNotFoundException} If the PromotionCategory with the given id does not exist.
   * @throws {PrismaClientKnownRequestError} For other Prisma errors.
   */
  async delete(id: string): Promise<void> {
    try {
      await this.prismaService.promotionCategory.delete({
        where: { id },
      });
    } catch (e) {
      if (e instanceof PrismaClientKnownRequestError) {
        if (e.code === 'P2025') {
          throw new PromotionCategoryNotFoundException(id);
        }
      }
      throw e;
    }
  }

  /**
   * Finds a PromotionCategory entity by its unique identifier.
   * @param id - The unique identifier of the PromotionCategory.
   * @returns The PromotionCategory domain object if found, otherwise null.
   */
  async findById(id: string): Promise<PromotionCategory | null> {
    return await this.prismaService.promotionCategory
      .findUnique({
        where: { id },
        include: {
          promotion: true,
          category: true,
        },
      })
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      ?.then(PromotionCategoryMapper.toDomain as any);
  }

  /**
   * Retrieves all PromotionCategory entities from the database.
   * @returns An array of PromotionCategory domain objects.
   */
  async getAll(): Promise<PromotionCategory[]> {
    return await this.prismaService.promotionCategory
      .findMany({
        include: {
          promotion: true,
          category: true,
        },
      })
      .then((records) => records.map(PromotionCategoryMapper.toDomain));
  }

  /**
   * Retrieves all promotions associated with a specific category ID.
   *
   * This method queries the database for all `PromotionCategory` records that match the given
   * `categoryId`, including their related `promotion` entities. It then maps each result to its
   * domain representation and extracts the associated `Promotion` objects, filtering out any
   * undefined or null values.
   *
   * For STAFF users, only returns promotions that are ACTIVE and not deleted.
   * For ADMIN and MANAGER users, returns all promotions including deleted and disabled ones.
   *
   * @param categoryId - The unique identifier of the category for which promotions are to be retrieved.
   * @param includeAll - If true, includes promotions with all statuses (for ADMIN/MANAGER). If false, only includes ACTIVE promotions (for STAFF).
   * @returns A promise that resolves to an array of `Promotion` domain objects associated with the given category.
   */
  async getPromotionsByCategoryId(
    categoryId: string,
    includeAll: boolean = false,
  ): Promise<Promotion[]> {
    // Build the where clause based on user role
    const whereClause = includeAll
      ? { category_id: categoryId }
      : {
          category_id: categoryId,
          promotion: {
            status: PromotionStatus.ACTIVE,
            is_deleted: false,
          },
        };

    const items = await this.prismaService.promotionCategory.findMany({
      where: whereClause,
      include: { promotion: true },
    });
    return items
      .map((item) => PromotionCategoryMapper.toDomain(item).promotion)
      .filter((promotion): promotion is Promotion => !!promotion);
  }
}
