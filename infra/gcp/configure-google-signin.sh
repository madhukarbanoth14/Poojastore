#!/usr/bin/env bash
# Apply a Google Identity Services Web client ID to Cloud Run (website + API)
# and local env files. Google has no public API to *create* that client — create
# it once in Cloud Console, then run this script.
#
# Create client:
#   https://console.cloud.google.com/auth/clients/create?project=pooja-store-app
#   Application type: Web application
#   Name: Pavitra Seva Web
#   Authorized JavaScript origins:
#     http://localhost:3001
#     https://pavitraseva.in
#     https://www.pavitraseva.in
#     https://pavitra-seva-web-tcjernzh5a-el.a.run.app
#   Authorized redirect URIs (optional for GIS popup, add anyway):
#     http://localhost:3001/login
#     https://pavitraseva.in/login
#     https://www.pavitraseva.in/login
#     https://pavitra-seva-web-tcjernzh5a-el.a.run.app/login
#
# Apply:
#   GOOGLE_WEB_CLIENT_ID=123-abc.apps.googleusercontent.com ./infra/gcp/configure-google-signin.sh
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
ACCOUNT="${ACCOUNT:-arunabanoth2580@gmail.com}"
PROJECT="${PROJECT:-pooja-store-app}"
REGION="${REGION:-asia-south1}"
WEB_SERVICE="${WEB_SERVICE:-pavitra-seva-web}"
API_PRODUCTION="${API_PRODUCTION:-pooja-api-production}"
API_STAGING="${API_STAGING:-pooja-api-staging}"
CREATE_URL="https://console.cloud.google.com/auth/clients/create?project=${PROJECT}"
CLIENT_ID="${GOOGLE_WEB_CLIENT_ID:-${1:-}}"

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

upsert_env() {
  local file="$1"
  local key="$2"
  local value="$3"
  python3 -c "
from pathlib import Path
import re, sys
path = Path(sys.argv[1])
key = sys.argv[2]
value = sys.argv[3]
text = path.read_text() if path.exists() else ''
pattern = re.compile(r'^' + re.escape(key) + r'=.*$', re.M)
line = f'{key}={value}'
if pattern.search(text):
    text = pattern.sub(line, text, count=1)
else:
    if text and not text.endswith('\n'):
        text += '\n'
    text += line + '\n'
path.write_text(text)
" "$file" "$key" "$value"
}

if [[ -z "$CLIENT_ID" ]]; then
  cat <<EOF
Google Sign-In needs a Web application OAuth client ID.

1. Open:
   $CREATE_URL
2. Application type: Web application
3. Name: Pavitra Seva Web
4. Authorized JavaScript origins:
   http://localhost:3001
   https://pavitraseva.in
   https://www.pavitraseva.in
   https://pavitra-seva-web-tcjernzh5a-el.a.run.app
5. Create, copy the Client ID (ends with .apps.googleusercontent.com)
6. Rerun:
   GOOGLE_WEB_CLIENT_ID=YOUR_CLIENT_ID $0
EOF
  if command -v open >/dev/null 2>&1; then
    open "$CREATE_URL"
  fi
  exit 1
fi

if [[ "$CLIENT_ID" != *.apps.googleusercontent.com ]]; then
  echo "Expected a Client ID ending in .apps.googleusercontent.com" >&2
  exit 1
fi

echo "Updating Cloud Run API audiences…"
gcloud run services update "$API_PRODUCTION" \
  --account="$ACCOUNT" \
  --project="$PROJECT" \
  --region="$REGION" \
  --update-env-vars="GOOGLE_CLIENT_IDS=${CLIENT_ID}" >/dev/null

if gcloud run services describe "$API_STAGING" \
  --account="$ACCOUNT" \
  --project="$PROJECT" \
  --region="$REGION" >/dev/null 2>&1; then
  gcloud run services update "$API_STAGING" \
    --account="$ACCOUNT" \
    --project="$PROJECT" \
    --region="$REGION" \
    --update-env-vars="GOOGLE_CLIENT_IDS=${CLIENT_ID}" >/dev/null
fi

echo "Updating Cloud Run website…"
gcloud run services update "$WEB_SERVICE" \
  --account="$ACCOUNT" \
  --project="$PROJECT" \
  --region="$REGION" \
  --update-env-vars="GOOGLE_WEB_CLIENT_ID=${CLIENT_ID}" >/dev/null

upsert_env "$ROOT/apps/web/.env.local" "GOOGLE_WEB_CLIENT_ID" "$CLIENT_ID"
upsert_env "$ROOT/apps/web/.env.local" "NEXT_PUBLIC_GOOGLE_CLIENT_ID" "$CLIENT_ID"
if [[ -f "$ROOT/apps/api/.env" ]]; then
  upsert_env "$ROOT/apps/api/.env" "GOOGLE_CLIENT_IDS" "$CLIENT_ID"
fi

echo "Google Sign-In client ID applied to production API, website, and local web env."
echo "Restart local Next.js if it is already running (apps/web)."
echo "If the live /login page still shows the old button, redeploy the website once:"
echo "  ./infra/gcp/deploy-web.sh"
