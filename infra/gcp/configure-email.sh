#!/usr/bin/env bash
# Mount Gmail SMTP settings from apps/api/.env onto Cloud Run (production API).
#
#   ./infra/gcp/configure-email.sh
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
ACCOUNT="${ACCOUNT:-arunabanoth2580@gmail.com}"
PROJECT="${PROJECT:-pooja-store-app}"
REGION="${REGION:-asia-south1}"
API_PRODUCTION="${API_PRODUCTION:-pooja-api-production}"
SA="pooja-api@${PROJECT}.iam.gserviceaccount.com"
ENV_FILE="${ENV_FILE:-$ROOT/apps/api/.env}"

if [[ ! -f "$ENV_FILE" ]]; then
  echo "Missing $ENV_FILE (EMAIL_* / SMTP_*)." >&2
  exit 1
fi

set -a
# shellcheck disable=SC1090
source "$ENV_FILE"
set +a

EMAIL_PROVIDER="${EMAIL_PROVIDER:-smtp}"
EMAIL_FROM="${EMAIL_FROM:-Pavitra Seva <pavitraseva@techfylabs.com>}"
PUBLIC_WEB_BASE_URL="${PUBLIC_WEB_BASE_URL:-https://pavitraseva.in}"
SMTP_HOST="${SMTP_HOST:-smtp.gmail.com}"
SMTP_PORT="${SMTP_PORT:-587}"
SMTP_USER="${SMTP_USER:-pavitraseva@techfylabs.com}"
SMTP_SECURE="${SMTP_SECURE:-false}"

if [[ -z "${SMTP_PASS:-}" ]]; then
  echo "SMTP_PASS must be set in $ENV_FILE (Gmail App Password)." >&2
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

# Values that contain @ cannot go in --update-env-vars with the @ delimiter.
upsert_secret pooja-production-email-from "$EMAIL_FROM"
upsert_secret pooja-production-smtp-user "$SMTP_USER"
upsert_secret pooja-production-smtp-pass "$SMTP_PASS"

SECRETS="EMAIL_FROM=pooja-production-email-from:latest,SMTP_USER=pooja-production-smtp-user:latest,SMTP_PASS=pooja-production-smtp-pass:latest"

echo "Updating Cloud Run ${API_PRODUCTION} with Gmail SMTP…"
gcloud run services update "$API_PRODUCTION" \
  --account="$ACCOUNT" \
  --project="$PROJECT" \
  --region="$REGION" \
  --update-secrets="$SECRETS" \
  --update-env-vars="^@^EMAIL_PROVIDER=${EMAIL_PROVIDER}@PUBLIC_WEB_BASE_URL=${PUBLIC_WEB_BASE_URL}@SMTP_HOST=${SMTP_HOST}@SMTP_PORT=${SMTP_PORT}@SMTP_SECURE=${SMTP_SECURE}"

URL="$(gcloud run services describe "$API_PRODUCTION" \
  --account="$ACCOUNT" --project="$PROJECT" --region="$REGION" \
  --format='value(status.url)')"
echo "Email SMTP configured on $URL"
echo "Orders email customers after payment succeeds (when the account has an email)."
