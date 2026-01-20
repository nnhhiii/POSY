import { PrismaClient } from '@prisma/client';

export async function seedCategories(prisma: PrismaClient) {
  const categories = [
    {
      name: 'Beverages',
      slug: 'beverages',
      description: 'Drinks and refreshments',
      is_active: true,
    },
    {
      name: 'Snacks',
      slug: 'snacks',
      description: 'Quick bites and snacks',
      is_active: true,
    },
    {
      name: 'Desserts',
      slug: 'desserts',
      description: 'Sweet treats and desserts',
      is_active: true,
    },
    {
      name: 'Main Course',
      slug: 'main-course',
      description: 'Main dishes and meals',
      is_active: true,
    },
    {
      name: 'Hot Drinks',
      slug: 'hot-drinks',
      description: 'Coffee, tea, and other hot beverages',
      is_active: true,
    },
    {
      name: 'Cold Drinks',
      slug: 'cold-drinks',
      description: 'Iced drinks and cold refreshments',
      is_active: true,
    },
    {
      name: 'Chips',
      slug: 'chips',
      description: 'Potato chips and similar snacks',
      is_active: false,
    },
    {
      name: 'Cakes',
      slug: 'cakes',
      description: 'Cakes and pastries',
      is_active: true,
    },
    {
      name: 'Vegetarian',
      slug: 'vegetarian',
      description: 'Vegetarian main courses',
      is_active: true,
    },
  ];

  for (const category of categories) {
    const exists = await prisma.category.findUnique({
      where: { slug: category.slug },
    });
    if (!exists) {
      await prisma.category.create({ data: category });
    }
  }
}
