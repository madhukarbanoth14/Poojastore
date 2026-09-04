#!/usr/bin/env bash
# Redeploy Pooja Store API staging to Cloud Run (asia-south1).
# Prerequisites: gcloud auth, project pooja-store-app, image already pushed.
set -euo pipefail

PROJECT="${PROJECT:-pooja-store-app}"
REGION="${REGION:-asia-south1}"
SERVICE="${SERVICE:-pooja-api-staging}"
SQL_INSTANCE="${SQL_INSTANCE:-pooja-store-staging}"
REDIS_INSTANCE="${REDIS_INSTANCE:-pooja-store-staging}"
IMAGE="${IMAGE:-asia-south1-docker.pkg.dev/${PROJECT}/pooja-store/api:staging}"
SA="pooja-api@${PROJECT}.iam.gserviceaccount.com"

gcloud config set project "$PROJECT" >/dev/null

CONNECTION_NAME="$(gcloud sql instances describe "$SQL_INSTANCE" \
  --project="$PROJECT" \
  --format='value(connectionName)')"

REDIS_HOST="$(gcloud redis instances describe "$REDIS_INSTANCE" \
  --project="$PROJECT" \
  --region="$REGION" \
  --format='value(host)')"

REDIS_PORT="$(gcloud redis instances describe "$REDIS_INSTANCE" \
  --project="$PROJECT" \
  --region="$REGION" \
  --format='value(port)')"

REDIS_AUTH="$(gcloud redis instances get-auth-string "$REDIS_INSTANCE" \
  --project="$PROJECT" \
  --region="$REGION" \
  --format='value(authString)' | tr -d '\r\n')"
REDIS_AUTH="${REDIS_AUTH#authString: }"
REDIS_AUTH="${REDIS_AUTH#"${REDIS_AUTH%%[![:space:]]*}"}"
REDIS_AUTH="${REDIS_AUTH%"${REDIS_AUTH##*[![:space:]]}"}"

POSTGRES_PASSWORD="$(gcloud secrets versions access latest \
  --secret=pooja-staging-postgres-password \
  --project="$PROJECT")"

DATABASE_URL="postgresql://postgres:${POSTGRES_PASSWORD}@localhost/pooja_store?host=/cloudsql/${CONNECTION_NAME}"
REDIS_URL="redis://default:${REDIS_AUTH}@${REDIS_HOST}:${REDIS_PORT}"

upsert_secret() {
  local name="$1"
  local value="$2"
  if gcloud secrets describe "$name" --project="$PROJECT" >/dev/null 2>&1; then
    printf '%s' "$value" | gcloud secrets versions add "$name" --project="$PROJECT" --data-file=-
  else
    printf '%s' "$value" | gcloud secrets create "$name" \
      --project="$PROJECT" \
      --replication-policy=user-managed \
      --locations="$REGION" \
      --data-file=-
  fi
}

upsert_secret pooja-staging-database-url "$DATABASE_URL"
upsert_secret pooja-staging-redis-url "$REDIS_URL"

# Optional Razorpay test keys — export before deploy or load from apps/api/.env locally.
# With keys set, checkout uses Razorpay even when PAYMENT_MODE=mock (test mode).
if [[ -f apps/api/.env ]]; then
  set -a
  # shellcheck disable=SC1091
  source apps/api/.env
  set +a
fi

if [[ -z "${GOOGLE_CLIENT_IDS:-}" ]]; then
  GOOGLE_CLIENT_IDS="$(gcloud run services describe "$SERVICE" \
    --project="$PROJECT" --region="$REGION" \
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

if [[ -n "${RAZORPAY_KEY_ID:-}" && -n "${RAZORPAY_KEY_SECRET:-}" ]]; then
  upsert_secret pooja-staging-razorpay-key-id "$RAZORPAY_KEY_ID"
  upsert_secret pooja-staging-razorpay-key-secret "$RAZORPAY_KEY_SECRET"
  SECRETS="${SECRETS},RAZORPAY_KEY_ID=pooja-staging-razorpay-key-id:latest,RAZORPAY_KEY_SECRET=pooja-staging-razorpay-key-secret:latest"
  if [[ -n "${RAZORPAY_WEBHOOK_SECRET:-}" ]]; then
    upsert_secret pooja-staging-razorpay-webhook-secret "$RAZORPAY_WEBHOOK_SECRET"
    SECRETS="${SECRETS},RAZORPAY_WEBHOOK_SECRET=pooja-staging-razorpay-webhook-secret:latest"
  fi
  echo "Razorpay test keys will be mounted on Cloud Run."
else
  echo "WARNING: RAZORPAY_KEY_ID/SECRET not set — checkout will fall back to MOCK on staging."
fi

gcloud run deploy "$SERVICE" \
  --project="$PROJECT" \
  --region="$REGION" \
  --image="$IMAGE" \
  --service-account="$SA" \
  --port=3000 \
  --cpu=1 \
  --memory=1Gi \
  --min-instances=0 \
  --max-instances=2 \
  --timeout=300 \
  --allow-unauthenticated \
  --add-cloudsql-instances="$CONNECTION_NAME" \
  --network=default \
  --subnet=default \
  --vpc-egress=private-ranges-only \
  --set-secrets="$SECRETS" \
  --set-env-vars="^@^NODE_ENV=development@API_PREFIX=api@API_VERSION=1@JWT_ACCESS_TTL_SECONDS=900@JWT_REFRESH_TTL_SECONDS=2592000@OTP_LENGTH=6@OTP_TTL_SECONDS=300@OTP_MAX_ATTEMPTS=5@OTP_MAX_REQUESTS_PER_HOUR=5@OTP_RETURN_IN_RESPONSE=true@SMS_PROVIDER=console@SWAGGER_ENABLED=true@PAYMENT_MODE=mock@PUBLIC_API_BASE_URL=https://pooja-api-staging-tcjernzh5a-el.a.run.app@LOG_LEVEL=info@GOOGLE_CLIENT_IDS=${GOOGLE_CLIENT_IDS:-}"

URL="$(gcloud run services describe "$SERVICE" --project="$PROJECT" --region="$REGION" --format='value(status.url)')"
echo "Deployed: $URL"
echo "Health:   $URL/api/v1/health/ready"
