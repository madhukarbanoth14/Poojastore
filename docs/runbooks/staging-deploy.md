# Staging & Production Deploy Runbook

## Environments

| Env | Purpose | Compose / host |
|-----|---------|----------------|
| local | Developer machines | `docker-compose.yml` (Postgres `:5433`, Redis `:6379`) |
| staging (GCP) | Hosted pre-prod | Cloud Run + Cloud SQL + Memorystore — [gcp-staging.md](gcp-staging.md) |
| staging (compose) | Single-host fallback | `docker-compose.staging.yml` |
| production | Live traffic | Same image as staging; separate GCP project/secrets + DB |

## Prerequisites

- Docker + Docker Compose
- Secrets stored outside git (CI secrets / vault / host env files)
- Public HTTPS URL for API (webhooks require it)

## Staging bring-up

```bash
# From repo root
cp apps/api/.env.staging.example apps/api/.env.staging
# Edit apps/api/.env.staging with real staging secrets

docker compose -f docker-compose.staging.yml --env-file apps/api/.env.staging up -d --build
```

What this does:

1. Starts Postgres + Redis (internal network; not published in staging compose)
2. Builds API image from `apps/api/Dockerfile`
3. Runs `prisma migrate deploy` then `node dist/main.js`

### Verify

```bash
curl -fsS https://staging.example.com/api/v1/health/ready
```

Optional seed (staging only — never on production with demo phones):

```bash
docker compose -f docker-compose.staging.yml exec api npx prisma db seed
```

## Migrations

Always migrate forward:

```bash
# Local
cd apps/api && npx prisma migrate deploy

# Staging / prod container
docker compose -f docker-compose.staging.yml exec api npx prisma migrate deploy
```

Never use `prisma migrate reset` outside disposable local DBs.

## Production config gates

`NODE_ENV=production` refuses boot unless:

| Variable | Required value |
|----------|----------------|
| `PAYMENT_MODE` | `live` |
| `SMS_PROVIDER` | `twilio` (with `TWILIO_*`) |
| `OTP_RETURN_IN_RESPONSE` | `false` / unset |
| `SWAGGER_ENABLED` | `false` |
| JWT secrets | no `change-me` substring |
| Live gateways | Razorpay and/or Stripe keys + webhook secrets |

## Webhook setup

1. Set `PUBLIC_API_BASE_URL=https://api.example.com`
2. Razorpay dashboard → webhook URL  
   `https://api.example.com/api/v1/payments/razorpay/webhook`  
   Events: `payment.captured`, `payment.failed`, `refund.processed`
3. Stripe dashboard → webhook URL  
   `https://api.example.com/api/v1/payments/stripe/webhook`  
   Events: `checkout.session.completed`, `checkout.session.expired`, `charge.refunded`, `refund.updated`
4. Copy webhook signing secrets into `RAZORPAY_WEBHOOK_SECRET` / `STRIPE_WEBHOOK_SECRET`

## SMS (Twilio)

1. Create Messaging Service or purchase a from-number
2. Set `SMS_PROVIDER=twilio` + `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, and either `TWILIO_FROM_NUMBER` or `TWILIO_MESSAGING_SERVICE_SID`
3. Request OTP on staging and confirm SMS delivery (OTP must **not** appear in API JSON)

## Admin refunds

```http
POST /api/v1/payments/:paymentId/refund
Authorization: Bearer <admin access token>
{ "amountMinor": 50000, "reason": "customer_request" }
```

Partial refunds allowed up to original `amountMinor`. Webhooks also mark `REFUNDED` when the provider confirms.

## Rollback

1. Redeploy previous image tag
2. Do **not** auto-rollback migrations; write a forward fix migration if schema must change
3. Disable traffic via load balancer / stop compose service

## Checklist before promoting staging → production

- [ ] `GET /health/ready` green
- [ ] OTP SMS delivers; no `debugOtp` in responses
- [ ] Test Razorpay (IN) + Stripe (US) payment + webhook confirm
- [ ] Admin refund smoke test
- [ ] Flutter release build with `ALLOW_MOCK_PAYMENTS=false`
- [ ] Backups configured for Postgres
- [ ] Alerts on 5xx / webhook failures
