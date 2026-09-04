import { PrismaClient } from '@prisma/client';
import { seedPoojaSamagri } from './samagri-catalog';

const prisma = new PrismaClient();

async function main() {
  await seedPoojaSamagri(prisma);
}

main()
  .catch((err) => {
    console.error('Catalog sync failed', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
