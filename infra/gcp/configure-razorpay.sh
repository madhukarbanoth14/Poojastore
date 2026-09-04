#!/usr/bin/env bash
# Mount Razorpay keys from apps/api/.env onto Cloud Run (production API).
# Test keys (rzp_test_…) are enough to try Checkout on pavitraseva.in.
# Swap the same secrets to rzp_live_… later without a code change.
#
#   ./infra/gcp/configure-razorpay.sh
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
ACCOUNT="${ACCOUNT:-arunabanoth2580@gmail.com}"
PROJECT="${PROJECT:-pooja-store-app}"
REGION="${REGION:-asia-south1}"
API_PRODUCTION="${API_PRODUCTION:-pooja-api-production}"
SA="pooja-api@${PROJECT}.iam.gserviceaccount.com"
ENV_FILE="${ENV_FILE:-$ROOT/apps/api/.env}"

if [[ ! -f "$ENV_FILE" ]]; then
  echo "Missing $ENV_FILE (RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET)." >&2
  exit 1
fi

set -a
# shellcheck disable=SC1090
source "$ENV_FILE"
set +a

if [[ -z "${RAZORPAY_KEY_ID}" || -z "${RAZORPAY_KEY_SECRET}" ]]; then
  echo "RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET must be set in $ENV_FILE." >&2
  exit 1
fi

if [[ "$RAZORPAY_KEY_ID" == rzp_test_* ]]; then
  echo "Using Razorpay TEST key ${RAZORPAY_KEY_ID:0:12}…"
elif [[ "$RAZORPAY_KEY_ID" == rzp_live_* ]]; then
  echo "Using Razorpay LIVE key ${RAZORPAY_KEY_ID:0:12}…"
else
  echo "RAZORPAY_KEY_ID should start with rzp_test_ or rzp_live_." >&2
  exit 1
fi

upsert_secret() {
  local name="$1"
  local value="$2"
  if gcloud secrets describe "$name" --account="$ACCOUNT" --project="$PROJECT" >/dev/null 2>&1; then
    printf '%s' "$value" | gcloud secrets versions add "$name" \
      --account="$ACCOUNT" --project="$PROJECT" --data-file=-
  else
    printf '%s' "$value" | gcloud secrets create "$name" \
      --account="$ACCOUNT" \
      --project="$PROJECT" \
      --replication-policy=user-managed \
      --locations="$REGION" \
      --data-file=-
  fi
  gcloud secrets add-iam-policy-binding "$name" \
    --account="$ACCOUNT" \
    --project="$PROJECT" \
    --member="serviceAccount:${SA}" \
    --role="roles/secretmanager.secretAccessor" \
    --quiet >/dev/null
}

SECRET_KEY_ID="${SECRET_KEY_ID:-pooja-production-razorpay-key-id}"
SECRET_KEY_SECRET="${SECRET_KEY_SECRET:-pooja-production-razorpay-key-secret}"
SECRET_WEBHOOK="${SECRET_WEBHOOK:-pooja-production-razorpay-webhook-secret}"

upsert_secret "$SECRET_KEY_ID" "$RAZORPAY_KEY_ID"
upsert_secret "$SECRET_KEY_SECRET" "$RAZORPAY_KEY_SECRET"
SECRETS="RAZORPAY_KEY_ID=${SECRET_KEY_ID}:latest,RAZORPAY_KEY_SECRET=${SECRET_KEY_SECRET}:latest"
if [[ -n "${RAZORPAY_WEBHOOK_SECRET}" ]]; then
  upsert_secret "$SECRET_WEBHOOK" "$RAZORPAY_WEBHOOK_SECRET"
  SECRETS="${SECRETS},RAZORPAY_WEBHOOK_SECRET=${SECRET_WEBHOOK}:latest"
fi

update_api() {
  local service="$1"
  echo "Updating Cloud Run ${service}…"
  gcloud run services update "$service" \
    --account="$ACCOUNT" \
    --project="$PROJECT" \
    --region="$REGION" \
    --update-secrets="$SECRETS" \
    --update-env-vars="PAYMENT_MODE=live"
}

update_api "$API_PRODUCTION"

echo "Razorpay keys mounted on ${API_PRODUCTION}."
echo "Checkout on https://pavitraseva.in will open Razorpay (test cards if key is rzp_test_)."
echo "When live keys are ready, put them in apps/api/.env and rerun this script."
