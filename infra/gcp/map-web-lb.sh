#!/usr/bin/env bash
# Front pavitra-seva-web with a global HTTPS load balancer so pavitraseva.in
# can be attached. Cloud Run domain mapping is not available in asia-south1.
set -euo pipefail

ACCOUNT="${ACCOUNT:-arunabanoth2580@gmail.com}"
PROJECT="${PROJECT:-pooja-store-app}"
REGION="${REGION:-asia-south1}"
SERVICE="${SERVICE:-pavitra-seva-web}"
GCLOUD=(gcloud --account="$ACCOUNT" --project="$PROJECT")

exists() {
  local resource="$1"
  shift
  "${GCLOUD[@]}" "$resource" describe "$@" >/dev/null 2>&1
}

if ! exists compute addresses pavitraseva-web-ip --global; then
  "${GCLOUD[@]}" compute addresses create pavitraseva-web-ip \
    --network-tier=PREMIUM --ip-version=IPV4 --global
fi

if ! exists compute network-endpoint-groups pavitraseva-web-neg --region="$REGION"; then
  "${GCLOUD[@]}" compute network-endpoint-groups create pavitraseva-web-neg \
    --region="$REGION" \
    --network-endpoint-type=serverless \
    --cloud-run-service="$SERVICE"
fi

if ! exists compute backend-services pavitraseva-web-backend --global; then
  "${GCLOUD[@]}" compute backend-services create pavitraseva-web-backend \
    --load-balancing-scheme=EXTERNAL_MANAGED \
    --global
  "${GCLOUD[@]}" compute backend-services add-backend pavitraseva-web-backend \
    --global \
    --network-endpoint-group=pavitraseva-web-neg \
    --network-endpoint-group-region="$REGION"
fi

if ! exists compute ssl-certificates pavitraseva-web-cert --global; then
  "${GCLOUD[@]}" compute ssl-certificates create pavitraseva-web-cert \
    --domains=pavitraseva.in,www.pavitraseva.in \
    --global
fi

if ! exists compute url-maps pavitraseva-web-url-map; then
  "${GCLOUD[@]}" compute url-maps create pavitraseva-web-url-map \
    --default-service=pavitraseva-web-backend
fi

if ! exists compute target-https-proxies pavitraseva-web-https-proxy; then
  "${GCLOUD[@]}" compute target-https-proxies create pavitraseva-web-https-proxy \
    --ssl-certificates=pavitraseva-web-cert \
    --url-map=pavitraseva-web-url-map
fi

if ! exists compute forwarding-rules pavitraseva-web-https --global; then
  "${GCLOUD[@]}" compute forwarding-rules create pavitraseva-web-https \
    --load-balancing-scheme=EXTERNAL_MANAGED \
    --network-tier=PREMIUM \
    --address=pavitraseva-web-ip \
    --target-https-proxy=pavitraseva-web-https-proxy \
    --global \
    --ports=443
fi

if ! exists compute url-maps pavitraseva-web-http-redirect; then
  tmp="$(mktemp)"
  cat > "$tmp" <<'EOF'
name: pavitraseva-web-http-redirect
defaultUrlRedirect:
  httpsRedirect: true
  redirectResponseCode: MOVED_PERMANENTLY_DEFAULT
EOF
  "${GCLOUD[@]}" compute url-maps import pavitraseva-web-http-redirect \
    --source="$tmp" --global --quiet
  rm -f "$tmp"
fi

if ! exists compute target-http-proxies pavitraseva-web-http-proxy; then
  "${GCLOUD[@]}" compute target-http-proxies create pavitraseva-web-http-proxy \
    --url-map=pavitraseva-web-http-redirect
fi

if ! exists compute forwarding-rules pavitraseva-web-http --global; then
  "${GCLOUD[@]}" compute forwarding-rules create pavitraseva-web-http \
    --load-balancing-scheme=EXTERNAL_MANAGED \
    --network-tier=PREMIUM \
    --address=pavitraseva-web-ip \
    --target-http-proxy=pavitraseva-web-http-proxy \
    --global \
    --ports=80
fi

IP="$("${GCLOUD[@]}" compute addresses describe pavitraseva-web-ip --global --format='get(address)')"
echo "Load balancer IP: $IP"
echo "GoDaddy DNS (replace parking A records):"
echo "  Host @    Type A      Value $IP"
echo "  Host www  Type A      Value $IP   (or keep CNAME www -> pavitraseva.in)"
echo "Keep the google-site-verification TXT record."
echo "SSL certificate stays PROVISIONING until those A records point here."
"${GCLOUD[@]}" compute ssl-certificates describe pavitraseva-web-cert --global \
  --format='yaml(managed.status,managed.domainStatus)'
