# Pooja Store

Hindu Spiritual Super App — production monorepo.

| App | Stack | Path |
|-----|-------|------|
| API | NestJS 11 + Prisma 6 + PostgreSQL + Redis | `apps/api` |
| Mobile | Flutter (Material 3) | `apps/mobile` |
| Web | Next.js 15 (App Router) | `apps/web` |

Living architecture: [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md)  
Production bar: [`docs/PRODUCTION_READINESS.md`](docs/PRODUCTION_READINESS.md)  
Roadmap: [`docs/PRODUCT_ROADMAP.md`](docs/PRODUCT_ROADMAP.md)  
Staging deploy: [`docs/runbooks/staging-deploy.md`](docs/runbooks/staging-deploy.md)  
Website on pavitraseva.in: [`docs/runbooks/godaddy-web-domain.md`](docs/runbooks/godaddy-web-domain.md)

> The previous Expo prototype sources (`App.js`, `src/`) are legacy reference only. Production mobile is Flutter.

## Prerequisites

- Node.js 22+
- Flutter stable
- Docker Desktop (Postgres + Redis)

## Quick start

```bash
# 1) Infrastructure (Postgres on host port 5433 to avoid local Postgres conflicts)
docker compose up -d postgres redis

# 2) API
cd apps/api
cp .env.example .env   # already present for local dev
npm install
npx prisma migrate deploy
npx prisma db seed
npm run start:dev
```

- API: http://localhost:3000/api/v1  
- Swagger: http://localhost:3000/docs  
- Health: http://localhost:3000/api/v1/health/ready  
- GCP staging: https://pooja-api-staging-tcjernzh5a-el.a.run.app/api/v1 (see [`docs/runbooks/gcp-staging.md`](docs/runbooks/gcp-staging.md))  

```bash
# 3) Mobile
cd apps/mobile
flutter pub get
flutter run \
  --dart-define=API_BASE_URL=http://127.0.0.1:3000/api/v1
```

On Android emulators use `http://10.0.2.2:3000/api/v1`.

```bash
# 4) Website
cd apps/web
cp .env.example .env.local   # already points at local API
npm install
npm run dev
```

- Web: http://localhost:3001  
- Uses the same Nest API as mobile (`API_BASE_URL` / `NEXT_PUBLIC_API_BASE_URL`).

## Commerce + payments

1. `GET /api/v1/products?market=IN&type=PUJA_KIT`
2. Auth → add to cart → create address → `POST /api/v1/orders/checkout`
3. Payment providers:
   - **Local/dev:** `PAYMENT_MODE=mock` → `POST /api/v1/payments/:id/mock-confirm` (disabled when `NODE_ENV=production` or `PAYMENT_MODE=live`)
   - **Production:** `PAYMENT_MODE=live` required — India → Razorpay (`RAZORPAY_*`), USA/Canada → Stripe (`STRIPE_*`)
4. Webhooks are the source of truth: `/api/v1/payments/razorpay/webhook`, `/api/v1/payments/stripe/webhook`

Flutter release builds: pass `--dart-define=ALLOW_MOCK_PAYMENTS=false` (or run `./scripts/build-mobile-release.sh`).

See `docs/features/02-kits-and-payments.md`, `docs/PRODUCTION_READINESS.md`, and `docs/runbooks/staging-deploy.md`.

## Auth flow

1. `POST /api/v1/auth/otp/request` with `{ "countryCode": "91", "phone": "9876543210" }`
2. In development only, response may include `debugOtp` (`OTP_RETURN_IN_RESPONSE=true`)
3. `POST /api/v1/auth/otp/verify` with the OTP
4. Use `Authorization: Bearer <accessToken>` for `/auth/me` and admin routes

Seeded admin phone: `+919999999999` (already promoted by seed).

Production: `SMS_PROVIDER=twilio`, `OTP_RETURN_IN_RESPONSE=false` (enforced at boot).

## Tests

```bash
cd apps/api
npm test
npm run test:e2e
```

## Feature delivery rule

Ship **production-operable** vertical slices: schema → API → Flutter → admin/ops → tests → docs.  
No mock/console shortcuts on production paths. See `docs/PRODUCTION_READINESS.md`.
