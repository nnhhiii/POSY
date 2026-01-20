import 'dotenv/config';
import { seedAdmin, seedStaff } from './seeds/accounts.seed';
import { seedCategories } from './seeds/categories.seed';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import { seedPromotions } from './seeds/promotions.seed';
import { seedProducts } from './seeds/products.seed';

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error('DATABASE_URL is not defined');
}

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
  await seedAdmin(prisma);
  await seedStaff(prisma);
  await seedCategories(prisma);
  await seedPromotions(prisma);
  await seedProducts(prisma);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
