#!/usr/bin/env bash
# Redeploy Pooja Store API production to Cloud Run (asia-south1).
# Uses the same Cloud SQL / Redis as staging until a dedicated prod DB exists.
# NODE_ENV stays development until Twilio + live payment webhooks are configured
# (production gates otherwise refuse to boot).
set -euo pipefail

ACCOUNT="${ACCOUNT:-arunabanoth2580@gmail.com}"
PROJECT="${PROJECT:-pooja-store-app}"
REGION="${REGION:-asia-south1}"
SERVICE="${SERVICE:-pooja-api-production}"
SQL_INSTANCE="${SQL_INSTANCE:-pooja-store-staging}"
REDIS_INSTANCE="${REDIS_INSTANCE:-pooja-store-staging}"
IMAGE="${IMAGE:-asia-south1-docker.pkg.dev/${PROJECT}/pooja-store/api:production}"
SA="pooja-api@${PROJECT}.iam.gserviceaccount.com"
PUBLIC_API_BASE_URL="${PUBLIC_API_BASE_URL:-https://pooja-api-production-tcjernzh5a-el.a.run.app}"
CORS_ORIGINS="${CORS_ORIGINS:-https://pavitraseva.in,https://www.pavitraseva.in,https://pavitra-seva-web-tcjernzh5a-el.a.run.app}"

gcloud config set project "$PROJECT" --account="$ACCOUNT" >/dev/null

CONNECTION_NAME="$(gcloud sql instances describe "$SQL_INSTANCE" \
  --account="$ACCOUNT" \
  --project="$PROJECT" \
  --format='value(connectionName)')"

REDIS_HOST="$(gcloud redis instances describe "$REDIS_INSTANCE" \
  --account="$ACCOUNT" \
  --project="$PROJECT" \
  --region="$REGION" \
  --format='value(host)')"

REDIS_PORT="$(gcloud redis instances describe "$REDIS_INSTANCE" \
  --account="$ACCOUNT" \
  --project="$PROJECT" \
  --region="$REGION" \
  --format='value(port)')"

REDIS_AUTH="$(gcloud redis instances get-auth-string "$REDIS_INSTANCE" \
  --account="$ACCOUNT" \
  --project="$PROJECT" \
  --region="$REGION" \
  --format='value(authString)' | tr -d '\r\n')"
REDIS_AUTH="${REDIS_AUTH#authString: }"
REDIS_AUTH="${REDIS_AUTH#"${REDIS_AUTH%%[![:space:]]*}"}"
REDIS_AUTH="${REDIS_AUTH%"${REDIS_AUTH##*[![:space:]]}"}"

POSTGRES_PASSWORD="$(gcloud secrets versions access latest \
  --secret=pooja-staging-postgres-password \
  --account="$ACCOUNT" \
  --project="$PROJECT")"

DATABASE_URL="postgresql://postgres:${POSTGRES_PASSWORD}@localhost/pooja_store?host=/cloudsql/${CONNECTION_NAME}"
REDIS_URL="redis://default:${REDIS_AUTH}@${REDIS_HOST}:${REDIS_PORT}"

upsert_secret() {
  local name="$1"
  local value="$2"
  if gcloud secrets describe "$name" --account="$ACCOUNT" --project="$PROJECT" >/dev/null 2>&1; then
    printf '%s' "$value" | gcloud secrets versions add "$name" --account="$ACCOUNT" --project="$PROJECT" --data-file=-
  else
    printf '%s' "$value" | gcloud secrets create "$name" \
      --account="$ACCOUNT" \
      --project="$PROJECT" \
      --replication-policy=user-managed \
      --locations="$REGION" \
      --data-file=-
  fi
}

upsert_secret pooja-staging-database-url "$DATABASE_URL"
upsert_secret pooja-staging-redis-url "$REDIS_URL"

if [[ -f apps/api/.env ]]; then
  set -a
  # shellcheck disable=SC1091
  source apps/api/.env
  set +a
fi

# Local .env CORS/localhost must not override the public site origins.
CORS_ORIGINS="${CORS_ORIGINS_OVERRIDE:-https://pavitraseva.in,https://www.pavitraseva.in,https://pavitra-seva-web-tcjernzh5a-el.a.run.app}"
PUBLIC_API_BASE_URL="${PUBLIC_API_BASE_URL_OVERRIDE:-https://pooja-api-production-tcjernzh5a-el.a.run.app}"

# Never push Razorpay test keys onto production.
if [[ "${RAZORPAY_KEY_ID:-}" == rzp_test* ]]; then
  echo "Skipping Razorpay: local .env has test keys."
  unset RAZORPAY_KEY_ID RAZORPAY_KEY_SECRET RAZORPAY_WEBHOOK_SECRET
fi

# Website-relative QR paths need a public HTTPS URL in production metadata.
if [[ "${UPI_QR_IMAGE_URL:-}" == /* ]]; then
  UPI_QR_IMAGE_URL="https://pavitraseva.in${UPI_QR_IMAGE_URL}"
fi

if [[ -z "${GOOGLE_CLIENT_IDS:-}" ]]; then
  GOOGLE_CLIENT_IDS="$(gcloud run services describe "$SERVICE" \
    --account="$ACCOUNT" --project="$PROJECT" --region="$REGION" \
    --format=json 2>/dev/null | python3 -c "
import json, sys
try:
    data = json.load(sys.stdin)
except Exception:
    raise SystemExit
containers = (((data.get('spec') or {}).get('template') or {}).get('spec') or {}).get('containers') or [{}]
envs = (containers[0] or {}).get('env') or []
for item in envs:
    if item.get('name') == 'GOOGLE_CLIENT_IDS':
        print(item.get('value') or '', end='')
        break
" || true)"
fi

SECRETS="DATABASE_URL=pooja-staging-database-url:latest,REDIS_URL=pooja-staging-redis-url:latest,JWT_ACCESS_SECRET=pooja-staging-jwt-access:latest,JWT_REFRESH_SECRET=pooja-staging-jwt-refresh:latest"
PAYMENT_MODE=mock

if [[ -n "${RAZORPAY_KEY_ID:-}" && -n "${RAZORPAY_KEY_SECRET:-}" ]]; then
  upsert_secret pooja-production-razorpay-key-id "$RAZORPAY_KEY_ID"
  upsert_secret pooja-production-razorpay-key-secret "$RAZORPAY_KEY_SECRET"
  gcloud secrets add-iam-policy-binding pooja-production-razorpay-key-id \
    --account="$ACCOUNT" --project="$PROJECT" \
    --member="serviceAccount:${SA}" \
    --role="roles/secretmanager.secretAccessor" --quiet >/dev/null
  gcloud secrets add-iam-policy-binding pooja-production-razorpay-key-secret \
    --account="$ACCOUNT" --project="$PROJECT" \
    --member="serviceAccount:${SA}" \
    --role="roles/secretmanager.secretAccessor" --quiet >/dev/null
  SECRETS="${SECRETS},RAZORPAY_KEY_ID=pooja-production-razorpay-key-id:latest,RAZORPAY_KEY_SECRET=pooja-production-razorpay-key-secret:latest"
  PAYMENT_MODE=live
  if [[ -n "${RAZORPAY_WEBHOOK_SECRET:-}" ]]; then
    upsert_secret pooja-production-razorpay-webhook-secret "$RAZORPAY_WEBHOOK_SECRET"
    gcloud secrets add-iam-policy-binding pooja-production-razorpay-webhook-secret \
      --account="$ACCOUNT" --project="$PROJECT" \
      --member="serviceAccount:${SA}" \
      --role="roles/secretmanager.secretAccessor" --quiet >/dev/null
    SECRETS="${SECRETS},RAZORPAY_WEBHOOK_SECRET=pooja-production-razorpay-webhook-secret:latest"
  fi
  echo "Razorpay keys will be mounted on Cloud Run (PAYMENT_MODE=live)."
elif gcloud secrets describe pooja-production-razorpay-key-id \
    --account="$ACCOUNT" --project="$PROJECT" >/dev/null 2>&1; then
  SECRETS="${SECRETS},RAZORPAY_KEY_ID=pooja-production-razorpay-key-id:latest,RAZORPAY_KEY_SECRET=pooja-production-razorpay-key-secret:latest"
  PAYMENT_MODE=live
  echo "Keeping existing production Razorpay secrets (not overwritten)."
fi

# VPA contains @ so it cannot go in --set-env-vars (^@^ delimiter).
if [[ -n "${UPI_VPA:-}" ]]; then
  upsert_secret pooja-production-upi-vpa "$UPI_VPA"
  gcloud secrets add-iam-policy-binding pooja-production-upi-vpa \
    --account="$ACCOUNT" --project="$PROJECT" \
    --member="serviceAccount:${SA}" \
    --role="roles/secretmanager.secretAccessor" --quiet >/dev/null
  SECRETS="${SECRETS},UPI_VPA=pooja-production-upi-vpa:latest"
  PAYMENT_MODE=live
  echo "Company UPI VPA will be mounted (PAYMENT_MODE=live)."
elif gcloud secrets describe pooja-production-upi-vpa \
    --account="$ACCOUNT" --project="$PROJECT" >/dev/null 2>&1; then
  SECRETS="${SECRETS},UPI_VPA=pooja-production-upi-vpa:latest"
  PAYMENT_MODE=live
  echo "Keeping existing production UPI VPA secret (not overwritten)."
fi

ENV_EXTRA=""
if [[ -z "${UPI_PAYEE_NAME:-}" ]]; then
  UPI_PAYEE_NAME="Pavitra Seva"
fi
ENV_EXTRA="${ENV_EXTRA}@UPI_PAYEE_NAME=${UPI_PAYEE_NAME}"

if [[ -z "${UPI_QR_IMAGE_URL:-}" ]]; then
  UPI_QR_IMAGE_URL="https://pavitraseva.in/images/payments/company-upi-qr.jpeg"
fi
ENV_EXTRA="${ENV_EXTRA}@UPI_QR_IMAGE_URL=${UPI_QR_IMAGE_URL}"
PAYMENT_MODE=live

# Gmail SMTP for order confirmation emails (EMAIL_FROM / SMTP_USER / SMTP_PASS
# contain @ so they must be secrets, not --set-env-vars entries).
EMAIL_PROVIDER="${EMAIL_PROVIDER:-smtp}"
PUBLIC_WEB_BASE_URL="${PUBLIC_WEB_BASE_URL:-https://pavitraseva.in}"
SMTP_HOST="${SMTP_HOST:-smtp.gmail.com}"
SMTP_PORT="${SMTP_PORT:-587}"
SMTP_SECURE="${SMTP_SECURE:-false}"
EMAIL_FROM="${EMAIL_FROM:-Pavitra Seva <pavitraseva@techfylabs.com>}"
SMTP_USER="${SMTP_USER:-pavitraseva@techfylabs.com}"

if [[ -n "${SMTP_PASS:-}" ]]; then
  upsert_secret pooja-production-email-from "$EMAIL_FROM"
  upsert_secret pooja-production-smtp-user "$SMTP_USER"
  upsert_secret pooja-production-smtp-pass "$SMTP_PASS"
  for secret_name in pooja-production-email-from pooja-production-smtp-user pooja-production-smtp-pass; do
    gcloud secrets add-iam-policy-binding "$secret_name" \
      --account="$ACCOUNT" --project="$PROJECT" \
      --member="serviceAccount:${SA}" \
      --role="roles/secretmanager.secretAccessor" --quiet >/dev/null
  done
  SECRETS="${SECRETS},EMAIL_FROM=pooja-production-email-from:latest,SMTP_USER=pooja-production-smtp-user:latest,SMTP_PASS=pooja-production-smtp-pass:latest"
  ENV_EXTRA="${ENV_EXTRA}@EMAIL_PROVIDER=${EMAIL_PROVIDER}@PUBLIC_WEB_BASE_URL=${PUBLIC_WEB_BASE_URL}@SMTP_HOST=${SMTP_HOST}@SMTP_PORT=${SMTP_PORT}@SMTP_SECURE=${SMTP_SECURE}"
  echo "Gmail SMTP will be mounted for order confirmation emails."
elif gcloud secrets describe pooja-production-smtp-pass \
    --account="$ACCOUNT" --project="$PROJECT" >/dev/null 2>&1; then
  SECRETS="${SECRETS},EMAIL_FROM=pooja-production-email-from:latest,SMTP_USER=pooja-production-smtp-user:latest,SMTP_PASS=pooja-production-smtp-pass:latest"
  ENV_EXTRA="${ENV_EXTRA}@EMAIL_PROVIDER=${EMAIL_PROVIDER}@PUBLIC_WEB_BASE_URL=${PUBLIC_WEB_BASE_URL}@SMTP_HOST=${SMTP_HOST}@SMTP_PORT=${SMTP_PORT}@SMTP_SECURE=${SMTP_SECURE}"
  echo "Keeping existing production SMTP secrets (not overwritten)."
else
  echo "WARNING: SMTP_PASS unset — order confirmation emails will use console provider."
  ENV_EXTRA="${ENV_EXTRA}@EMAIL_PROVIDER=console@PUBLIC_WEB_BASE_URL=${PUBLIC_WEB_BASE_URL}"
fi

if [[ "$PAYMENT_MODE" != "live" ]]; then
  echo "WARNING: Razorpay and company UPI are unset — checkout will use MOCK."
fi

gcloud run deploy "$SERVICE" \
  --account="$ACCOUNT" \
  --project="$PROJECT" \
  --region="$REGION" \
  --image="$IMAGE" \
  --service-account="$SA" \
  --port=3000 \
  --cpu=1 \
  --memory=1Gi \
  --min-instances=0 \
  --max-instances=3 \
  --timeout=300 \
  --allow-unauthenticated \
  --add-cloudsql-instances="$CONNECTION_NAME" \
  --network=default \
  --subnet=default \
  --vpc-egress=private-ranges-only \
  --set-secrets="$SECRETS" \
  --set-env-vars="^@^NODE_ENV=development@API_PREFIX=api@API_VERSION=1@JWT_ACCESS_TTL_SECONDS=900@JWT_REFRESH_TTL_SECONDS=2592000@OTP_LENGTH=6@OTP_TTL_SECONDS=300@OTP_MAX_ATTEMPTS=5@OTP_MAX_REQUESTS_PER_HOUR=5@OTP_RETURN_IN_RESPONSE=true@SMS_PROVIDER=console@SWAGGER_ENABLED=false@PAYMENT_MODE=${PAYMENT_MODE}@PUBLIC_API_BASE_URL=${PUBLIC_API_BASE_URL}@CORS_ORIGINS=${CORS_ORIGINS}@LOG_LEVEL=info@GOOGLE_CLIENT_IDS=${GOOGLE_CLIENT_IDS:-}${ENV_EXTRA}"
URL="$(gcloud run services describe "$SERVICE" --account="$ACCOUNT" --project="$PROJECT" --region="$REGION" --format='value(status.url)')"
echo "Deployed: $URL"
echo "Health:   $URL/api/v1/health/ready"
