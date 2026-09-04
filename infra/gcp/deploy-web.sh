#!/usr/bin/env bash
# Build and deploy the Pavitra Seva website to Cloud Run, then print DNS records
# for pavitraseva.in (GoDaddy). Prerequisites: gcloud auth for pooja-store-app.
set -euo pipefail

ACCOUNT="${ACCOUNT:-arunabanoth2580@gmail.com}"
PROJECT="${PROJECT:-pooja-store-app}"
REGION="${REGION:-asia-south1}"
SERVICE="${SERVICE:-pavitra-seva-web}"
IMAGE="${IMAGE:-asia-south1-docker.pkg.dev/${PROJECT}/pooja-store/web:production}"
API_BASE="${API_BASE:-https://pooja-api-production-tcjernzh5a-el.a.run.app/api/v1}"
SITE_URL="${SITE_URL:-https://pavitraseva.in}"
APEX_DOMAIN="${APEX_DOMAIN:-pavitraseva.in}"
WWW_DOMAIN="${WWW_DOMAIN:-www.pavitraseva.in}"

run_env() {
  local service="$1"
  local key="$2"
  gcloud run services describe "$service" \
    --account="$ACCOUNT" \
    --project="$PROJECT" \
    --region="$REGION" \
    --format=json 2>/dev/null | python3 -c "
import json, sys
key = sys.argv[1]
try:
    data = json.load(sys.stdin)
except Exception:
    raise SystemExit
containers = (((data.get('spec') or {}).get('template') or {}).get('spec') or {}).get('containers') or [{}]
envs = (containers[0] or {}).get('env') or []
for item in envs:
    if item.get('name') == key:
        print(item.get('value') or '', end='')
        break
" "$key"
}

if [[ -z "${GOOGLE_WEB_CLIENT_ID:-}" ]]; then
  GOOGLE_WEB_CLIENT_ID="$(run_env "$SERVICE" GOOGLE_WEB_CLIENT_ID || true)"
fi
if [[ -z "${APPLE_WEB_CLIENT_ID:-}" ]]; then
  APPLE_WEB_CLIENT_ID="$(run_env "$SERVICE" APPLE_WEB_CLIENT_ID || true)"
fi

gcloud builds submit apps/web \
  --account="$ACCOUNT" \
  --project="$PROJECT" \
  --tag="$IMAGE" \
  --timeout=1200

gcloud run deploy "$SERVICE" \
  --account="$ACCOUNT" \
  --project="$PROJECT" \
  --region="$REGION" \
  --image="$IMAGE" \
  --port=3000 \
  --cpu=1 \
  --memory=1Gi \
  --min-instances=0 \
  --max-instances=3 \
  --timeout=300 \
  --allow-unauthenticated \
  --set-env-vars="NODE_ENV=production,API_BASE_URL=${API_BASE},NEXT_PUBLIC_API_BASE_URL=${API_BASE},NEXT_PUBLIC_SITE_URL=${SITE_URL},NEXT_PUBLIC_ALLOW_MOCK_PAYMENTS=false,GOOGLE_WEB_CLIENT_ID=${GOOGLE_WEB_CLIENT_ID:-},APPLE_WEB_CLIENT_ID=${APPLE_WEB_CLIENT_ID:-}"

URL="$(gcloud run services describe "$SERVICE" \
  --account="$ACCOUNT" \
  --project="$PROJECT" \
  --region="$REGION" \
  --format='value(status.url)')"
echo "Deployed: $URL"

map_domain() {
  local domain="$1"
  if gcloud beta run domain-mappings describe "$domain" \
    --account="$ACCOUNT" \
    --project="$PROJECT" \
    --region="$REGION" >/dev/null 2>&1; then
    echo "Domain mapping already exists: $domain"
  else
    gcloud beta run domain-mappings create \
      --account="$ACCOUNT" \
      --project="$PROJECT" \
      --region="$REGION" \
      --service="$SERVICE" \
      --domain="$domain" || true
  fi
  echo "----- DNS for $domain -----"
  gcloud beta run domain-mappings describe "$domain" \
    --account="$ACCOUNT" \
    --project="$PROJECT" \
    --region="$REGION" \
    --format='yaml(status.resourceRecords)' 2>/dev/null || true
}

map_domain "$APEX_DOMAIN"
map_domain "$WWW_DOMAIN"

echo "Site URL: $SITE_URL"
echo "Cloud Run: $URL"
