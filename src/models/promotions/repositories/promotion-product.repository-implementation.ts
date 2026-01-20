import { PromotionProductRepository } from './promotion-product.repository-abstract';
import { Promotion, PromotionProduct, PromotionProductMapper } from '../types';
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../providers/prisma/prisma.service';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/client';
import { DuplicateEntryException } from '../../../common/exceptions';
import { PromotionProductNotFoundException } from '../exceptions';
import { PromotionStatus } from '@prisma/client';
import e from 'express';

@Injectable()
export class PromotionProductRepositoryImpl implements PromotionProductRepository {
  constructor(private readonly prismaService: PrismaService) {}

  /**
   * Creates a new PromotionProduct entity in the database.
   * Converts the domain entity to Prisma format, attempts to persist it, and maps the result back to domain.
   * Throws DuplicateEntryException if a unique constraint violation occurs.
   *
   * @param {PromotionProduct} entity - The PromotionProduct domain entity to create.
   * @returns {Promise<PromotionProduct>} The created PromotionProduct domain entity.
   * @throws {DuplicateEntryException} If a PromotionProduct with the given data already exists.
   * @throws {PrismaClientKnownRequestError} For other Prisma client errors.
   */
  async create(entity: PromotionProduct): Promise<PromotionProduct> {
    try {
      const prisma = PromotionProductMapper.toPrisma(entity);
      return await this.prismaService.promotionProduct
        .create({
          data: prisma,
        })
        .then(PromotionProductMapper.toDomain);
    } catch (e) {
      if (e instanceof PrismaClientKnownRequestError) {
        if (e.code === 'P2002') {
          throw new DuplicateEntryException(
            'PromotionProduct with given data already exists.',
          );
        }
      }
      throw e;
    }
  }

  /**
   * Deletes a PromotionProduct entity by its unique identifier.
   * Throws PromotionProductNotFoundException if the entity does not exist.
   *
   * @param {string} id - The unique identifier of the PromotionProduct to delete.
   * @returns {Promise<void>} Resolves when deletion is successful.
   * @throws {PromotionProductNotFoundException} If the PromotionProduct does not exist.
   * @throws {PrismaClientKnownRequestError} For other Prisma client errors.
   */
  async delete(id: string): Promise<void> {
    try {
      await this.prismaService.promotionProduct.delete({
        where: { id },
      });
    } catch (e) {
      if (e instanceof PrismaClientKnownRequestError) {
        if (e.code === 'P2025') {
          throw new PromotionProductNotFoundException(id);
        }
      }
      throw e;
    }
  }

  /**
   * Finds a PromotionProduct entity by its unique identifier.
   * Returns the domain entity if found, or null if not found.
   *
   * @param {string} id - The unique identifier of the PromotionProduct to find.
   * @returns {Promise<PromotionProduct | null>} The found PromotionProduct domain entity or null.
   */
  async findById(id: string): Promise<PromotionProduct | null> {
    return await this.prismaService.promotionProduct
      .findUnique({
        where: { id },
      })
      ?.then(PromotionProductMapper.toDomain);
  }

  /**
   * Retrieves all PromotionProduct entities from the database.
   * Maps the results to domain entities.
   *
   * @returns {Promise<PromotionProduct[]>} An array of all PromotionProduct domain entities.
   */
  async getAll(): Promise<PromotionProduct[]> {
    return await this.prismaService.promotionProduct
      .findMany({})
      .then((results) => results.map(PromotionProductMapper.toDomain));
  }

  /**
   * Retrieves all promotions associated with a given product ID.
   * Queries the `promotionProduct` table for records matching the specified product ID,
   * including the related `promotion` entity. Maps the results to domain `Promotion` entities,
   * filtering out any items where the promotion is not present.
   *
   * For STAFF users, only returns promotions that are ACTIVE and not deleted.
   * For ADMIN and MANAGER users, returns all promotions including deleted and disabled ones.
   *
   * @param {string} productId - The unique identifier of the product for which promotions are to be retrieved.
   * @param {boolean} includeAll - If true, includes promotions with all statuses (for ADMIN/MANAGER). If false, only includes ACTIVE promotions (for STAFF).
   * @returns {Promise<Promotion[]>} A promise that resolves to an array of `Promotion` domain entities associated with the product.
   *
   * @throws {PrismaClientKnownRequestError} For any Prisma client errors encountered during the query.
   */
  async getPromotionsByProductId(
    productId: string,
    includeAll: boolean = false,
  ): Promise<Promotion[]> {
    // Build the where clause based on user role
    const whereClause = includeAll
      ? { product_id: productId }
      : {
          product_id: productId,
          promotion: {
            status: PromotionStatus.ACTIVE,
            is_deleted: false,
          },
        };

    return await this.prismaService.promotionProduct
      .findMany({
        where: whereClause,
        include: { promotion: true },
      })
      .then((items) => {
        return items
          .map((item) => PromotionProductMapper.toDomain(item).promotion)
          .filter((promotion): promotion is Promotion => !!promotion);
      });
  }
}
