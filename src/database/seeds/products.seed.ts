import { faker } from '@faker-js/faker';
import { PrismaClient, ProductDiscountType } from '@prisma/client';
import { MeiliSearch } from 'meilisearch';
import { ProductDiscountType as DomainProductDiscountType } from '../../models/products/enums/discount-type.enum';

if (!process.env.MEILI_HOST) {
  throw new Error('Meilisearch host is missing in environment variables.');
}

if (!process.env.MEILI_MASTER_KEY) {
  throw new Error(
    'Meilisearch master key is missing in environment variables.',
  );
}

const meiliClient = new MeiliSearch({
  host: process.env.MEILI_HOST,
  apiKey: process.env.MEILI_MASTER_KEY,
});

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

  // After seeding, fetch all products with their categories
  const seededProducts = await prisma.product.findMany({
    include: { category: true },
  });

  // Convert seededProducts (Prisma result) to Product[] (camelCase, all required fields)
  const productsForMeili = seededProducts.map((p) => ({
    id: p.id,
    name: p.name,
    price:
      typeof p.price === 'object' && p.price !== null && 'toNumber' in p.price
        ? p.price.toNumber()
        : p.price,
    discountType: p.discount_type as DomainProductDiscountType,
    discountValue:
      p.discount_value !== null &&
      typeof p.discount_value === 'object' &&
      'toNumber' in p.discount_value
        ? p.discount_value.toNumber()
        : p.discount_value,
    imageUrl: p.image_url,
    isDeleted: p.is_deleted,
    isAvailable: p.is_available,
    stockQuantity: p.stock_quantity,
    createdAt: p.created_at,
    updatedAt: p.updated_at,
    categoryId: p.category_id,
    sku: p.sku,
    description: p.description,
    deletedAt: p.deleted_at,
    category: p.category,
  }));

  // Index to Meilisearch
  await meiliClient.index('products').addDocuments(productsForMeili);
}
