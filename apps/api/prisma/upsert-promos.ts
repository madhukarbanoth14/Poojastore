import { PrismaClient, PromoDiscountType } from '@prisma/client';

const prisma = new PrismaClient();

const CODES = [
  {
    code: 'PAVITRA10',
    description: '10% off Pavitra Seva kits and samagri',
  },
  {
    code: 'GANESH10',
    description: '10% off Ganesh Chaturthi kits',
  },
] as const;

async function main() {
  for (const item of CODES) {
    const promo = await prisma.promoCode.upsert({
      where: { code: item.code },
      create: {
        code: item.code,
        description: item.description,
        discountType: PromoDiscountType.PERCENT,
        percentOff: 10,
        amountMinor: null,
        minSubtotalMinor: 0,
        maxDiscountMinor: null,
        isActive: true,
      },
      update: {
        description: item.description,
        discountType: PromoDiscountType.PERCENT,
        percentOff: 10,
        amountMinor: null,
        minSubtotalMinor: 0,
        maxDiscountMinor: null,
        isActive: true,
      },
    });
    console.log(`${promo.code} · ${promo.percentOff}% · active=${promo.isActive}`);
  }
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
