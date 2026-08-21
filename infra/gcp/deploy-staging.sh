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
  --set-secrets="DATABASE_URL=pooja-staging-database-url:latest,REDIS_URL=pooja-staging-redis-url:latest,JWT_ACCESS_SECRET=pooja-staging-jwt-access:latest,JWT_REFRESH_SECRET=pooja-staging-jwt-refresh:latest" \
  --set-env-vars="NODE_ENV=development,API_PREFIX=api,API_VERSION=1,JWT_ACCESS_TTL_SECONDS=900,JWT_REFRESH_TTL_SECONDS=2592000,OTP_LENGTH=6,OTP_TTL_SECONDS=300,OTP_MAX_ATTEMPTS=5,OTP_MAX_REQUESTS_PER_HOUR=5,OTP_RETURN_IN_RESPONSE=true,SMS_PROVIDER=console,SWAGGER_ENABLED=true,PAYMENT_MODE=mock,LOG_LEVEL=info"

URL="$(gcloud run services describe "$SERVICE" --project="$PROJECT" --region="$REGION" --format='value(status.url)')"
echo "Deployed: $URL"
echo "Health:   $URL/api/v1/health/ready"
