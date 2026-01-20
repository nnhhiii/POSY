import { faker } from '@faker-js/faker';
import { PrismaClient, ProductDiscountType } from '@prisma/client';

export async function seedProducts(prisma: PrismaClient) {
  // Fetch all categories from the database
  const categories = await prisma.category.findMany({
    where: { is_active: true },
    select: { id: true },
  });

  if (!categories.length) {
    throw new Error('No active categories found. Seed categories first.');
  }

  const products = Array.from({ length: 30 }).map(() => {
    const category = faker.helpers.arrayElement(categories);
    const discountType = faker.helpers.arrayElement([
      ProductDiscountType.PERCENTAGE,
      ProductDiscountType.FIXED_AMOUNT,
      undefined,
    ]);
    let discountValue: number | null = null;
    if (discountType === ProductDiscountType.PERCENTAGE) {
      discountValue = faker.number.float({
        min: 1,
        max: 50,
        fractionDigits: 2,
      });
    } else if (discountType === ProductDiscountType.FIXED_AMOUNT) {
      discountValue = faker.number.float({
        min: 1,
        max: 100,
        fractionDigits: 2,
      });
    }
    return {
      category_id: category.id,
      sku: faker.string.alphanumeric(8).toUpperCase(),
      name: faker.commerce.productName(),
      description: faker.commerce.productDescription(),
      price: faker.number.float({ min: 1, max: 500, fractionDigits: 2 }),
      discount_type: discountType,
      discount_value: discountValue,
      image_url: faker.image.urlPicsumPhotos({ width: 500, height: 500 }),
      stock_quantity: faker.number.int({ min: 0, max: 200 }),
      is_available: faker.datatype.boolean(),
      is_deleted: false,
      deleted_at: null,
      created_at: faker.date.past({ years: 1 }),
      updated_at: new Date(),
    };
  });

  for (const product of products) {
    // Ensure SKU uniqueness
    const exists = await prisma.product.findUnique({
      where: { sku: product.sku },
    });
    if (!exists) {
      await prisma.product.create({ data: product });
    }
  }
}
