# Pooja Store API

NestJS backend for the Pooja Store production app.

## Local development

```bash
cp .env.example .env
npm ci
npx prisma migrate deploy
npx prisma db seed
npm run start:dev
```

- API: `http://localhost:3000/api/v1`
- Swagger (dev): `http://localhost:3000/docs`
- Health: `http://localhost:3000/api/v1/health/ready`

Infra (from repo root): `docker compose up -d postgres redis`

## Production / staging

See [`docs/runbooks/staging-deploy.md`](../../docs/runbooks/staging-deploy.md).

```bash
# Staging compose (repo root)
cp apps/api/.env.staging.example apps/api/.env.staging
# fill secrets, then:
docker compose -f docker-compose.staging.yml --env-file apps/api/.env.staging up -d --build
```

Production gates reject mock payments, console SMS, OTP-in-response, and Swagger.

## Key endpoints

| Area | Paths |
|------|--------|
| Auth | `POST /auth/otp/request`, `POST /auth/otp/verify` |
| Payments | `POST /payments/razorpay/webhook`, `POST /payments/stripe/webhook` |
| Admin refund | `POST /payments/:id/refund` (ADMIN) |
| Mock confirm | `POST /payments/:id/mock-confirm` (dev only) |

## Tests

```bash
npm test
npm run test:e2e
```
