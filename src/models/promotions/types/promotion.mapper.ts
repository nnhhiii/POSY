import { Promotion as DomainPromotion } from './index';
import { Prisma, Promotion as PrismaPromotion } from '@prisma/client';
import {
  PromotionApplicability as DomainPromotionApplicability,
  PromotionDiscountType as DomainPromotionDiscountType,
  PromotionStatus as DomainPromotionStatus,
} from '../enums';

export class PromotionMapper {
  static toDomain(this: void, prisma: PrismaPromotion): DomainPromotion {
    return new DomainPromotion(
      prisma.id,
      prisma.code,
      prisma.title,
      prisma.description ?? null,
      prisma.discount_type as DomainPromotionDiscountType,
      prisma.discount_value !== null && prisma.discount_value !== undefined
        ? Number(prisma.discount_value)
        : 0,
      prisma.max_discount_amount !== null &&
        prisma.max_discount_amount !== undefined
        ? Number(prisma.max_discount_amount)
        : null,
      prisma.min_order_value !== null && prisma.min_order_value !== undefined
        ? Number(prisma.min_order_value)
        : 0,
      prisma.applicability as DomainPromotionApplicability,
      prisma.min_quantity !== null && prisma.min_quantity !== undefined
        ? prisma.min_quantity
        : null,
      prisma.start_at,
      prisma.end_at,
      prisma.usage_limit !== null && prisma.usage_limit !== undefined
        ? prisma.usage_limit
        : null,
      prisma.usage_count ?? 0,
      prisma.version ?? 1,
      prisma.status as DomainPromotionStatus,
      prisma.is_stackable ?? false,
      prisma.priority ?? 0,
      prisma.is_deleted ?? false,
      prisma.deleted_at ?? null,
      prisma.created_at,
      prisma.updated_at,
    );
  }

  static toPrisma(domain: DomainPromotion): PrismaPromotion {
    return {
      ...(domain.id ? { id: domain.id } : {}),
      code: domain.code,
      title: domain.title,
      description: domain.description,
      discount_type: domain.discountType,
      discount_value:
        domain.discountValue !== undefined && domain.discountValue !== null
          ? new Prisma.Decimal(domain.discountValue)
          : undefined,
      max_discount_amount:
        domain.maxDiscountAmount !== undefined &&
        domain.maxDiscountAmount !== null
          ? new Prisma.Decimal(domain.maxDiscountAmount)
          : undefined,
      min_order_value:
        domain.minOrderValue !== undefined && domain.minOrderValue !== null
          ? new Prisma.Decimal(domain.minOrderValue)
          : undefined,
      applicability: domain.applicability,
      min_quantity:
        domain.minQuantity !== undefined && domain.minQuantity !== null
          ? domain.minQuantity
          : undefined,
      start_at: domain.startAt,
      end_at: domain.endAt,
      usage_limit:
        domain.usageLimit !== undefined && domain.usageLimit !== null
          ? domain.usageLimit
          : undefined,
      usage_count:
        domain.usageCount !== undefined && domain.usageCount !== null
          ? domain.usageCount
          : undefined,
      version:
        domain.version !== undefined && domain.version !== null
          ? domain.version
          : undefined,
      status: domain.status,
      is_stackable:
        domain.isStackable !== undefined && domain.isStackable !== null
          ? domain.isStackable
          : undefined,
      priority:
        domain.priority !== undefined && domain.priority !== null
          ? domain.priority
          : undefined,
      is_deleted:
        domain.isDeleted !== undefined && domain.isDeleted !== null
          ? domain.isDeleted
          : undefined,
      deleted_at:
        domain.deletedAt !== undefined && domain.deletedAt !== null
          ? domain.deletedAt
          : undefined,
      created_at: domain.createdAt,
      updated_at: domain.updateAt,
    } as PrismaPromotion;
  }
}
