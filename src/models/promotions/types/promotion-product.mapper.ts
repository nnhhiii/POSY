import { PromotionProduct as DomainPromotionProduct } from './promotion-product.class';
import { PromotionProduct as PrismaPromotionProduct } from '@prisma/client';
import { PromotionMapper } from './promotion.mapper';
import { ProductMapper } from '../../products/types';

export class PromotionProductMapper {
  static toDomain(
    this: void,
    prisma: PrismaPromotionProduct,
  ): DomainPromotionProduct {
    return new DomainPromotionProduct(
      prisma.id,
      prisma.promotion_id,
      prisma.product_id,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      (prisma as any).promotion
        ? // eslint-disable-next-line @typescript-eslint/no-unsafe-argument,@typescript-eslint/no-unsafe-member-access
          PromotionMapper.toDomain((prisma as any).promotion)
        : undefined,

      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      (prisma as any).product
        ? // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-argument
          ProductMapper.toDomain((prisma as any).product)
        : undefined,
    );
  }

  static toPrisma(domain: DomainPromotionProduct): PrismaPromotionProduct {
    return <PrismaPromotionProduct>{
      ...(domain.id ? { id: domain.id } : {}),
      promotion_id: domain.promotionId,
      product_id: domain.productId,
    };
  }
}
