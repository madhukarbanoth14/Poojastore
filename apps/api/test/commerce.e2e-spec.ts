import { INestApplication, ValidationPipe, VersioningType } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/core/database/prisma.service';

// CI runs `npx prisma db seed` before e2e so PUJA_KIT products exist.

async function loginAs(
  app: INestApplication,
  phone: string,
  fullName: string,
) {
  const otpRes = await request(app.getHttpServer())
    .post('/api/v1/auth/otp/request')
    .send({ countryCode: '91', phone })
    .expect(200);
  const debugOtp = otpRes.body.data.debugOtp as string;
  const verifyRes = await request(app.getHttpServer())
    .post('/api/v1/auth/otp/verify')
    .send({
      countryCode: '91',
      phone,
      code: debugOtp,
      fullName,
      deviceId: `e2e-${phone}`,
    })
    .expect(200);
  return verifyRes.body.data.tokens.accessToken as string;
}

describe('Commerce bookings (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;
  const phone = '9111112233';

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    app.enableVersioning({ type: VersioningType.URI });
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();
    prisma = app.get(PrismaService);
  });

  afterAll(async () => {
    const user = await prisma.user.findUnique({
      where: { phoneE164: `+91${phone}` },
    });
    if (user) {
      await prisma.packageBooking.deleteMany({ where: { userId: user.id } });
      await prisma.priestBooking.deleteMany({ where: { userId: user.id } });
      await prisma.payment.deleteMany({
        where: { order: { userId: user.id } },
      });
      await prisma.orderItem.deleteMany({
        where: { order: { userId: user.id } },
      });
      await prisma.order.deleteMany({ where: { userId: user.id } });
      await prisma.cartItem.deleteMany({
        where: { cart: { userId: user.id } },
      });
      await prisma.cart.deleteMany({ where: { userId: user.id } });
      await prisma.address.deleteMany({ where: { userId: user.id } });
      await prisma.refreshToken.deleteMany({ where: { userId: user.id } });
      await prisma.otpChallenge.deleteMany({ where: { userId: user.id } });
      await prisma.auditLog.deleteMany({ where: { userId: user.id } });
      await prisma.user.delete({ where: { id: user.id } });
    }
    await app.close();
  });

  it('checks out a kit with mock payment and lists order', async () => {
    const token = await loginAs(app, phone, 'Commerce E2E');

    const products = await request(app.getHttpServer())
      .get('/api/v1/products')
      .query({ market: 'IN', type: 'PUJA_KIT' })
      .expect(200);
    const kit = products.body.data.items[0];
    expect(kit?.id).toBeDefined();

    await request(app.getHttpServer())
      .post('/api/v1/cart/items')
      .set('Authorization', `Bearer ${token}`)
      .send({ productId: kit.id, quantity: 1 })
      .expect(201);

    const addressRes = await request(app.getHttpServer())
      .post('/api/v1/addresses')
      .set('Authorization', `Bearer ${token}`)
      .send({
        label: 'Home',
        line1: '12 Temple Road',
        city: 'Bengaluru',
        state: 'KA',
        postalCode: '560001',
        country: 'IN',
        isDefault: true,
      })
      .expect(201);
    const addressId = addressRes.body.data.id as string;

    const checkout = await request(app.getHttpServer())
      .post('/api/v1/orders/checkout')
      .set('Authorization', `Bearer ${token}`)
      .send({ shippingAddressId: addressId })
      .expect(201);

    const paymentId = checkout.body.data.payment.id as string;
    expect(checkout.body.data.payment.provider).toBe('MOCK');

    await request(app.getHttpServer())
      .post(`/api/v1/payments/${paymentId}/mock-confirm`)
      .set('Authorization', `Bearer ${token}`)
      .expect(201);

    const orders = await request(app.getHttpServer())
      .get('/api/v1/orders')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
    expect(orders.body.data.items.length).toBeGreaterThan(0);
    expect(['PAID', 'FULFILLING']).toContain(orders.body.data.items[0].status);
  });

  it('books a priest, cancels before start, and releases slot', async () => {
    const token = await loginAs(app, phone, 'Commerce E2E');

    const priests = await request(app.getHttpServer())
      .get('/api/v1/priests')
      .query({ market: 'IN' })
      .expect(200);
    const priest = priests.body.data.items[0];
    expect(priest?.slug).toBeDefined();

    const detail = await request(app.getHttpServer())
      .get(`/api/v1/priests/${priest.slug}`)
      .expect(200);
    const slot = detail.body.data.slots?.[0];
    expect(slot?.id).toBeDefined();

    const addresses = await request(app.getHttpServer())
      .get('/api/v1/addresses')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
    let addressId = addresses.body.data.items?.[0]?.id as string | undefined;
    if (!addressId) {
      const created = await request(app.getHttpServer())
        .post('/api/v1/addresses')
        .set('Authorization', `Bearer ${token}`)
        .send({
          label: 'Home',
          line1: '12 Temple Road',
          city: 'Bengaluru',
          state: 'KA',
          postalCode: '560001',
          country: 'IN',
          isDefault: true,
        })
        .expect(201);
      addressId = created.body.data.id as string;
    }

    const book = await request(app.getHttpServer())
      .post(`/api/v1/priests/${priest.slug}/bookings`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        slotId: slot.id,
        addressId,
        serviceName: 'Satyanarayan Puja',
      })
      .expect(201);

    const bookingId = book.body.data.booking.id as string;
    const paymentId = book.body.data.payment.id as string;

    await request(app.getHttpServer())
      .post(`/api/v1/payments/${paymentId}/mock-confirm`)
      .set('Authorization', `Bearer ${token}`)
      .expect(201);

    const cancel = await request(app.getHttpServer())
      .post(`/api/v1/bookings/${bookingId}/cancel`)
      .set('Authorization', `Bearer ${token}`)
      .send({ reason: 'e2e cancel' })
      .expect(201);

    expect(cancel.body.data.booking.status).toBe('CANCELLED');
    expect(cancel.body.data.refundSuggested).toBe(true);

    const slotAfter = await prisma.priestSlot.findUnique({
      where: { id: slot.id },
    });
    expect(slotAfter?.isBooked).toBe(false);
  });

  it('exposes admin ops summary and health metrics', async () => {
    await request(app.getHttpServer())
      .get('/api/v1/health/metrics')
      .expect(200);

    const adminPhone = '9999999999';
    const admin = await prisma.user.findUnique({
      where: { phoneE164: `+91${adminPhone}` },
    });
    if (!admin) return;

    const otpRes = await request(app.getHttpServer())
      .post('/api/v1/auth/otp/request')
      .send({ countryCode: '91', phone: adminPhone })
      .expect(200);
    const token = (
      await request(app.getHttpServer())
        .post('/api/v1/auth/otp/verify')
        .send({
          countryCode: '91',
          phone: adminPhone,
          code: otpRes.body.data.debugOtp,
          deviceId: 'e2e-admin',
        })
        .expect(200)
    ).body.data.tokens.accessToken as string;

    const summary = await request(app.getHttpServer())
      .get('/api/v1/admin/ops/summary')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
    expect(summary.body.data.usersActive).toBeGreaterThan(0);
  });
});
