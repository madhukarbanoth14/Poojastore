import { INestApplication, ValidationPipe, VersioningType } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/core/database/prisma.service';

describe('Auth (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;

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
    await app.close();
  });

  it('requests OTP, verifies, and returns /me', async () => {
    const phone = '9123456789';
    const countryCode = '91';

    const otpRes = await request(app.getHttpServer())
      .post('/api/v1/auth/otp/request')
      .send({ countryCode, phone })
      .expect(200);

    expect(otpRes.body.success).toBe(true);
    const debugOtp = otpRes.body.data.debugOtp as string;
    expect(debugOtp).toMatch(/^\d{6}$/);

    const verifyRes = await request(app.getHttpServer())
      .post('/api/v1/auth/otp/verify')
      .send({
        countryCode,
        phone,
        code: debugOtp,
        fullName: 'E2E User',
        deviceId: 'e2e-device',
      })
      .expect(200);

    expect(verifyRes.body.data.tokens.accessToken).toBeDefined();
    const accessToken = verifyRes.body.data.tokens.accessToken as string;

    const meRes = await request(app.getHttpServer())
      .get('/api/v1/auth/me')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    expect(meRes.body.data.phoneE164).toBe('+919123456789');
    expect(meRes.body.data.fullName).toBe('E2E User');

    await prisma.user.deleteMany({ where: { phoneE164: '+919123456789' } });
  });
});
