# GCP staging (asia-south1)

Hosted staging for the NestJS API on Google Cloud. Flutter still ships via Play Store / App Store and points at this HTTPS URL.

## Project

| | |
|---|---|
| Project ID | `pooja-store-app` |
| Region | `asia-south1` (Mumbai) |
| Account | the GCP login used to create the project |

Console: [https://console.cloud.google.com/run/detail/asia-south1/pooja-api-staging/metrics?project=pooja-store-app](https://console.cloud.google.com/run/detail/asia-south1/pooja-api-staging/metrics?project=pooja-store-app)

**Staging API:** https://pooja-api-staging-tcjernzh5a-el.a.run.app/api/v1

## Resources

| Resource | Name |
|---|---|
| Artifact Registry | `asia-south1-docker.pkg.dev/pooja-store-app/pooja-store` |
| Cloud SQL (PostgreSQL 16) | `pooja-store-staging` |
| Memorystore Redis 7 | `pooja-store-staging` |
| Cloud Run | `pooja-api-staging`, `pooja-api-production`, `pavitra-seva-web` |
| Runtime SA | `pooja-api@pooja-store-app.iam.gserviceaccount.com` |

Secrets in Secret Manager (never commit these):

- `pooja-staging-postgres-password`
- `pooja-staging-jwt-access`
- `pooja-staging-jwt-refresh`
- `pooja-staging-database-url`
- `pooja-staging-redis-url`

## First boot config

The API image sets `NODE_ENV=production` in the Dockerfile. Staging Cloud Run **overrides** that to `development` until Twilio + Razorpay/Stripe keys are in Secret Manager. Production gates refuse to boot without them.

When those keys exist, redeploy with:

- `NODE_ENV=production`
- `PAYMENT_MODE=live`
- `SMS_PROVIDER=twilio`
- `OTP_RETURN_IN_RESPONSE=false`
- `SWAGGER_ENABLED=false`

## Redeploy API

```bash
gcloud config set project pooja-store-app

gcloud builds submit apps/api \
  --project=pooja-store-app \
  --tag=asia-south1-docker.pkg.dev/pooja-store-app/pooja-store/api:staging

./infra/gcp/deploy-staging.sh
```

## Verify

```bash
URL="$(gcloud run services describe pooja-api-staging --region=asia-south1 --format='value(status.url)')"
curl -fsS "$URL/api/v1/health/live"
curl -fsS "$URL/api/v1/health/ready"
```

Point Flutter at `$URL/api/v1`:

```bash
flutter run --dart-define=API_BASE_URL=https://<cloud-run-host>/api/v1
```

## Webhooks

After a custom domain (or using the `*.run.app` URL):

- Razorpay: `https://<host>/api/v1/payments/razorpay/webhook`
- Stripe: `https://<host>/api/v1/payments/stripe/webhook`

Set `PUBLIC_API_BASE_URL` to that origin.

## Cost notes (staging, approximate)

- Cloud SQL `db-f1-micro` + 10 GB SSD: small monthly charge
- Memorystore Redis 1 GB Basic: the largest ongoing cost
- Cloud Run with min instances = 0: near zero when idle
- Tear down: `gcloud sql instances delete pooja-store-staging` and `gcloud redis instances delete pooja-store-staging --region=asia-south1` when you no longer need staging
