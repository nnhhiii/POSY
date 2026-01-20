import { Prisma, Product as PrismaProduct } from '@prisma/client';
import { Product as DomainProduct } from './product.class';
import { ProductDiscountType } from '../enums';

export class ProductMapper {
  static toDomain(this: void, prisma: PrismaProduct): DomainProduct {
    return new DomainProduct(
      prisma.id,
      prisma.category_id,
      prisma.sku,
      prisma.name,
      prisma.description,
      prisma.price.toNumber(),
      prisma.discount_type
        ? (prisma.discount_type as ProductDiscountType)
        : null,
      prisma.discount_value !== undefined && prisma.discount_value !== null
        ? prisma.discount_value.toNumber()
        : null,
      prisma.image_url,
      prisma.stock_quantity,
      prisma.is_available,
      prisma.is_deleted,
      prisma.deleted_at,
      prisma.created_at,
      prisma.updated_at,
    );
  }

  static toPrisma(domain: DomainProduct): PrismaProduct {
    return <PrismaProduct>{
      ...(domain.id ? { id: domain.id } : {}),
      category_id: domain.categoryId,
      sku: domain.sku,
      name: domain.name,
      description: domain.description,
      price: new Prisma.Decimal(domain.price),
      discount_type: domain.discountType,
      discount_value: domain.discountValue,
      image_url: domain.imageUrl,
      stock_quantity: domain.stockQuantity,
      is_available: domain.isAvailable,
      is_deleted: domain.isDeleted,
      deleted_at: domain.deletedAt,
      created_at: domain.createdAt,
      updated_at: domain.updatedAt,
    };
  }
}
