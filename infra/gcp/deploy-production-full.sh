#!/usr/bin/env bash
# Build + deploy production API and website (pavitraseva.in) from the current
# checkout. Requires gcloud auth (user or service account) for pooja-store-app.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$ROOT"

ACCOUNT="${ACCOUNT:-arunabanoth2580@gmail.com}"
PROJECT="${PROJECT:-pooja-store-app}"
REGION="${REGION:-asia-south1}"
API_IMAGE="${API_IMAGE:-asia-south1-docker.pkg.dev/${PROJECT}/pooja-store/api:production}"
WEB_IMAGE="${WEB_IMAGE:-asia-south1-docker.pkg.dev/${PROJECT}/pooja-store/web:production}"

if [[ -n "${GCP_SA_KEY:-}" ]]; then
  KEY_FILE="$(mktemp)"
  printf '%s' "$GCP_SA_KEY" >"$KEY_FILE"
  gcloud auth activate-service-account --key-file="$KEY_FILE" --quiet
  export CLOUDSDK_CORE_ACCOUNT
  CLOUDSDK_CORE_ACCOUNT="$(python3 -c 'import json,sys; print(json.load(open(sys.argv[1]))["client_email"])' "$KEY_FILE")"
  ACCOUNT="$CLOUDSDK_CORE_ACCOUNT"
  rm -f "$KEY_FILE"
elif [[ -n "${GOOGLE_APPLICATION_CREDENTIALS:-}" && -f "${GOOGLE_APPLICATION_CREDENTIALS}" ]]; then
  gcloud auth activate-service-account --key-file="$GOOGLE_APPLICATION_CREDENTIALS" --quiet
  ACCOUNT="$(python3 -c 'import json,sys; print(json.load(open(sys.argv[1]))["client_email"])' "$GOOGLE_APPLICATION_CREDENTIALS")"
fi

export ACCOUNT PROJECT
gcloud config set project "$PROJECT" --account="$ACCOUNT" >/dev/null

echo "==> Building API image: $API_IMAGE"
gcloud builds submit apps/api \
  --account="$ACCOUNT" \
  --project="$PROJECT" \
  --tag="$API_IMAGE" \
  --timeout=1200

echo "==> Deploying API Cloud Run"
ACCOUNT="$ACCOUNT" PROJECT="$PROJECT" IMAGE="$API_IMAGE" \
  bash infra/gcp/deploy-production.sh

echo "==> Building + deploying website"
ACCOUNT="$ACCOUNT" PROJECT="$PROJECT" IMAGE="$WEB_IMAGE" \
  bash infra/gcp/deploy-web.sh

API_URL="$(gcloud run services describe pooja-api-production \
  --account="$ACCOUNT" --project="$PROJECT" --region="$REGION" \
  --format='value(status.url)')"
echo "API health: $API_URL/api/v1/health/ready"
curl -fsS "$API_URL/api/v1/health/live"
echo
curl -fsS "$API_URL/api/v1/health/ready"
echo
echo "Site: https://pavitraseva.in"
