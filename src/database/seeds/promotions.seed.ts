import {
  PrismaClient,
  PromotionDiscountType,
  PromotionStatus,
  PromotionApplicability,
} from '@prisma/client';

function randomEnum<T extends object>(anEnum: T): T[keyof T] {
  const enumValues = Object.values(anEnum) as T[keyof T][];
  return enumValues[Math.floor(Math.random() * enumValues.length)];
}

function randomString(length: number) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

function randomTitle() {
  const titles = [
    'Super Saver',
    'Holiday Special',
    'Weekend Deal',
    'Flash Sale',
    'Limited Offer',
    'Mega Discount',
    'Buy More Save More',
    'Exclusive Promo',
    'Seasonal Discount',
    'VIP Offer',
    'Clearance Sale',
  ];
  return titles[Math.floor(Math.random() * titles.length)];
}

export async function seedPromotions(prisma: PrismaClient) {
  const now = new Date();
  const promotions = Array.from({ length: 20 }).map(() => {
    const discount_type = randomEnum(PromotionDiscountType);
    const applicability = randomEnum(PromotionApplicability);
    const status = randomEnum(PromotionStatus);
    const min_order_value = Math.floor(Math.random() * 100) + 10;
    const discount_value =
      discount_type === 'PERCENTAGE'
        ? Math.floor(Math.random() * 30) + 5 // 5% - 35%
        : Math.floor(Math.random() * 50) + 5; // $5 - $55
    const max_discount_amount =
      discount_type === 'PERCENTAGE'
        ? Math.floor(Math.random() * 100) + 20 // $20 - $120
        : null;
    const min_quantity =
      applicability === 'QUANTITY_BASED'
        ? Math.floor(Math.random() * 4) + 2
        : null;
    const start_at = new Date(
      now.getTime() + Math.floor(Math.random() * 3) * 24 * 60 * 60 * 1000,
    ); // today or next 2 days
    const end_at = new Date(
      start_at.getTime() +
        (Math.floor(Math.random() * 7) + 1) * 24 * 60 * 60 * 1000,
    ); // 1-7 days after start
    // Mark some as deleted
    const is_deleted = Math.random() < 0.25; // ~25% deleted
    const deleted_at = is_deleted
      ? new Date(start_at.getTime() + 1000 * 60 * 60 * 24)
      : null;
    return {
      code: randomString(8),
      title: randomTitle(),
      description: 'Automatically generated promotion',
      discount_type,
      discount_value,
      max_discount_amount,
      min_order_value,
      applicability,
      min_quantity,
      start_at,
      end_at,
      usage_limit:
        Math.random() > 0.5 ? Math.floor(Math.random() * 100) + 10 : null,
      usage_count: 0,
      version: 1,
      status,
      is_stackable: Math.random() > 0.5,
      priority: Math.floor(Math.random() * 10),
      is_deleted,
      deleted_at,
    };
  });

  for (const promo of promotions) {
    const exists = await prisma.promotion.findUnique({
      where: { code: promo.code },
    });
    if (!exists) {
      await prisma.promotion.create({ data: promo });
    }
  }
}
